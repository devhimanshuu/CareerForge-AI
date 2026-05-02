import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import {
  Sparkles,
  Zap,
  Shield,
  Download,
  Share2,
  Palette,
  Bot,
  FileText,
  ArrowRight,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FallingPattern } from "@/components/ui/falling-pattern";
import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid";

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      {/* ===== Hero Section ===== */}
      <section className="relative w-full min-h-[95vh] flex items-center justify-center bg-background overflow-hidden">
        {/* Falling Pattern Background */}
        <div className="absolute inset-0 z-0">
          <FallingPattern
            className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
            color="hsl(var(--primary))"
          />
        </div>

        {/* Floating Orbs for extra depth */}
        <div className="absolute top-20 left-[15%] w-72 h-72 bg-indigo-500/10 rounded-full blur-[120px] animate-float z-0" />
        <div
          className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-float z-0"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10 w-full flex flex-col items-center justify-center pt-20 pb-24 max-w-5xl mx-auto px-5 text-center">
          {/* Badge */}
          <div className="animate-fade-up mb-8">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium glass border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                AI-Driven Career Excellence
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1
            className="text-6xl md:text-8xl font-black tracking-tight animate-fade-up leading-[0.9]"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-foreground">Elevate Your</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient py-2">
              Professional Story
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-up font-medium"
            style={{ animationDelay: "0.2s" }}
          >
            Resumify leverages advanced AI to craft high-impact, ATS-optimized
            resumes that capture attention and secure interviews.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex items-center justify-center gap-4 mt-12 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 gap-2 rounded-xl"
            >
              <Link href="/sign-up">
                <Sparkles size="18px" />
                Start Building — It&apos;s Free
                <ArrowRight size="16px" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-semibold border-indigo-500/20 hover:bg-indigo-500/10 text-foreground transition-all duration-300 gap-2 rounded-xl glass"
            >
              <Link href="#how-it-works">
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div
            className="flex items-center gap-6 mt-12 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex -space-x-2">
              {[
                "bg-indigo-500",
                "bg-purple-500",
                "bg-pink-500",
                "bg-cyan-500",
              ].map((color, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${color} border-2 border-background flex items-center justify-center text-white text-xs font-bold`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size="14px"
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="font-medium text-foreground">2,000+</span>{" "}
              resumes created
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="relative py-28 px-5">
        <CyberneticBentoGrid />
      </section>

      {/* ===== How It Works Section ===== */}
      <section id="how-it-works" className="relative py-28 px-5 mesh-gradient">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-border mb-4">
              <FileText size="14px" className="text-indigo-500" />
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Three Steps to Your{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Dream Resume
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Fill Your Details",
                description:
                  "Enter your personal info, experience, education, and skills using our intuitive form wizard.",
              },
              {
                step: "02",
                title: "Let AI Enhance It",
                description:
                  "Our AI generates professional summaries and work descriptions tailored to your industry.",
              },
              {
                step: "03",
                title: "Download & Share",
                description:
                  "Export as PDF or share with a unique link. Your resume is ready to land interviews.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative text-center p-8 rounded-2xl border border-border/50 bg-card/30 glass"
              >
                <div className="text-6xl font-black text-indigo-500/10 mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="relative py-28 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Ready to Build Your
                <br />
                Perfect Resume?
              </h2>
              <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
                Join thousands of professionals who&apos;ve landed their dream
                jobs with Resumify. Start building in seconds.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-10 text-base font-semibold bg-white text-indigo-600 hover:bg-white/90 shadow-xl shadow-black/20 transition-all duration-300 gap-2 rounded-xl"
                >
                  <Link href="/sign-up">
                    Start Building for Free
                    <ArrowRight size="16px" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border/50 py-12 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Resumify Logo"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Resumify
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Resumify. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
