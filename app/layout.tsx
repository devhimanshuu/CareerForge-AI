import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/context/query-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import PWARegister from "./_components/PWARegister";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "CareerForge AI — The Ultimate Career Suite",
  description:
    "Build stunning, ATS-optimized resumes, prepare for interviews, and track applications with our unified AI career platform.",
  keywords: [
    "resume builder",
    "AI resume",
    "ATS resume",
    "job application",
    "career tools",
    "interview coach",
  ],
  openGraph: {
    title: "CareerForge AI — The Ultimate Career Suite",
    description:
      "Build stunning, ATS-optimized resumes, prepare for interviews, and track applications with our unified AI career platform.",
    type: "website",
  },
  icons: {
    icon: "/CareerForge_ai_final.png",
    shortcut: "/CareerForge_ai_final.png",
    apple: "/CareerForge_ai_final.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "CareerForge AI",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased overflow-x-hidden",
          outfit.variable,
          plusJakartaSans.variable
        )}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#4F46E5",
            },
            elements: {
              footer: "hidden",
              userButtonPopoverFooter: "hidden",
              logoBox: "flex items-center justify-center gap-2 after:content-['CareerForge_AI'] after:font-bold after:text-xl after:tracking-tight after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:bg-clip-text after:text-transparent",
              logoImage: "w-8 h-8 rounded-lg shadow-lg shadow-indigo-500/25",
            },
            layout: {
              logoImageUrl: "/CareerForge_ai_final.png",
              helpPageUrl: "https://clerk.com",
              logoPlacement: "inside",
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton",
            },
          }}
        >
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
              <PWARegister />
            </ThemeProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
