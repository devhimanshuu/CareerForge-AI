import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/context/query-provider";
import { ClerkProvider } from "@clerk/nextjs";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
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
