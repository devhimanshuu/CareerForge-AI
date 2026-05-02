import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/context/query-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Resumify — AI-Powered Resume Builder",
  description:
    "Build stunning, ATS-optimized resumes in minutes with AI. Resumify helps you land your dream job with intelligent resume generation, real-time editing, and beautiful templates.",
  keywords: [
    "resume builder",
    "AI resume",
    "ATS resume",
    "job application",
    "career tools",
  ],
  openGraph: {
    title: "Resumify — AI-Powered Resume Builder",
    description:
      "Build stunning, ATS-optimized resumes in minutes with AI.",
    type: "website",
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6366F1",
        },
        elements: {
          footer: "hidden",
          logoBox: "flex items-center justify-center gap-2 after:content-['Resumify'] after:font-bold after:text-xl after:tracking-tight after:bg-gradient-to-r after:from-indigo-500 after:to-purple-600 after:bg-clip-text after:text-transparent",
          logoImage: "w-8 h-8 rounded-lg shadow-lg shadow-indigo-500/25",
        },
        layout: {
          logoImageUrl: "/logo.svg",
          helpPageUrl: "https://clerk.com",
          logoPlacement: "inside",
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "bg-background min-h-screen font-sans antialiased",
            inter.variable,
            inter.className
          )}
        >
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
