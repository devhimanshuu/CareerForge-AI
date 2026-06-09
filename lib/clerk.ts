import { auth, currentUser } from "@clerk/nextjs/server";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

type Env = {
  Variables: {
    user: {
        id: string;
        given_name: string | null;
        family_name: string | null;
        email: string | undefined;
        picture: string | null;
    };
  };
};

export const getAuthUser = createMiddleware<Env>(async (c, next) => {
  let userId: string | null = null;
  let user: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    userId = auth().userId;
    if (!userId) {
      throw new HTTPException(401, {
        res: c.json({ error: "unauthorized" }),
      });
    }
    user = await currentUser();
    if (!user) {
       throw new HTTPException(401, {
        res: c.json({ error: "unauthorized" }),
      });
    }
    
    c.set("user", {
        id: user.id,
        given_name: user.firstName,
        family_name: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        picture: user.imageUrl
    });
  } catch (error) {
    console.log(error);
    throw new HTTPException(401, {
      res: c.json({ error: "unauthorized" }),
    });
  }
  await next();
});
