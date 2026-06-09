import { Hono } from "hono";
import { getAuthUser } from "@/lib/clerk";
import { generateProfessionalAvatarDataUrl } from "@/lib/avatar-generator";

const imageRoute = new Hono()
  .post("/edit", getAuthUser, async (c) => {
    try {
      const { image, prompt, name, style } = await c.req.json();
      
      if (!image || !prompt) {
        return c.json({ error: "Missing image or prompt" }, 400);
      }

      // Extract base64 if it has data URL prefix
      const base64Image = image.includes("base64,") 
        ? image.split("base64,")[1] 
        : image;

      let resultImage = null;
      let error = null;

      // 1. Primary: Qwen Image Edit (NVIDIA)
      try {
        const response = await fetch("https://ai.api.nvidia.com/v1/visual/qwen/qwen-image-edit", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.NVIDIA_IMAGE_KEY}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64Image,
            prompt: prompt,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          resultImage = `data:image/png;base64,${data.image}`;
        } else {
          error = await response.text();
          console.warn("Primary NVIDIA Qwen failed, trying fallback...", error);
        }
      } catch (e) {
        console.warn("Primary NVIDIA Qwen error:", e);
      }

      // 2. Fallback: Professional SVG avatar generator (no API keys needed)
      if (!resultImage && name) {
        try {
          const avatarStyle = style === "corporate" || style === "creative" || style === "tech" ? style : "corporate";
          const avatarDataUrl = generateProfessionalAvatarDataUrl({
            name,
            style: avatarStyle,
            size: 200,
          });
          console.info("Generated professional SVG avatar fallback for:", name);
          
          return c.json({
            success: true,
            image: avatarDataUrl,
            isFallback: true,
            fallbackType: "svg-avatar",
          });
        } catch (avatarError) {
          console.warn("SVG avatar generation failed, using gradient fallback:", avatarError);
        }
      }

      // 3. Last resort: plain gradient placeholder
      if (!resultImage) {
        const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%234F46E5"/><stop offset="100%" stop-color="%237C3AED"/></linearGradient></defs><rect width="100" height="100" rx="30" fill="url(%23g)"/><text x="50" y="58" font-family="sans-serif" font-size="30" font-weight="900" fill="white" text-anchor="middle">CF</text></svg>`;
        
        return c.json({
          success: true,
          image: fallbackSvg,
          isFallback: true,
          fallbackType: "gradient-placeholder",
        });
      }

      return c.json({ 
        success: true, 
        image: resultImage,
        isFallback: false
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

export default imageRoute;
