import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { domain: string } }): Promise<Metadata> {
  try {
    const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${url}/api/document/public/domain/${params.domain}`, {
      cache: "no-store"
    });
    const result = await response.json();
    
    if (result.success && result.data) {
      const { personalInfo, summary } = result.data;
      const name = `${personalInfo?.firstName || ""} ${personalInfo?.lastName || ""}`.trim();
      const title = `${name} - ${personalInfo?.jobTitle || "Portfolio"}`;
      
      return {
        title,
        description: summary || `Professional portfolio for ${name}`,
        openGraph: {
          title,
          description: summary || `Professional portfolio for ${name}`,
          type: "website",
        },
      };
    }
  } catch (error) {
    console.error("Failed to generate metadata", error);
  }
  
  return {
    title: "Portfolio",
    description: "Personal Portfolio Website",
  };
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
