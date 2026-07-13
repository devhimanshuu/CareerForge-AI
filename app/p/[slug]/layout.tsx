import { Metadata } from "next";
import { db } from "@/db";
import { documentTable } from "@/db/schema/document";
import { and, eq } from "drizzle-orm";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      return {
        title: "Portfolio",
        description: "Personal Portfolio Website",
      };
    }

    const documentData = await db.query.documentTable.findFirst({
      where: and(
        eq(documentTable.status, "public"),
        eq(documentTable.slug, params.slug)
      ),
      with: {
        personalInfo: true,
      },
    });
    
    if (documentData) {
      const { personalInfo, summary } = documentData;
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

