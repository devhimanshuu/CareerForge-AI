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
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      {/* ===== Hero Section ===== */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center mesh-gradient noise-overlay">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-[15%] w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-[60%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-glow" />

        <div className="relative z-10 w-full flex flex-col items-center justify-center pt-16 pb-20 max-w-5xl mx-auto px-5">
          {/* Badge */}
          <div className="animate-fade-up mb-6">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium glass border border-indigo-500/20">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">
                Powered by AI
              </span>
              <span className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-2 py-0.5 font-semibold">
                New
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black text-center leading-[1.1] tracking-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-foreground">Build Resumes That</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Land Interviews
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground text-center max-w-2xl leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Resumify uses AI to craft stunning, ATS-optimized resumes in minutes.
            Stand out from the crowd and get hired faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 mt-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 gap-2 rounded-xl"
              >
                <Sparkles size="18px" />
                Start Building — It&apos;s Free
                <ArrowRight size="16px" />
              </Button>
            </SignUpButton>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-6 mt-8 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex -space-x-2">
              {["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500"].map((color, i) => (
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
                  <Star key={i} size="14px" className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-medium text-foreground">2,000+</span> resumes created
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="relative py-28 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-border mb-4">
              <Zap size="14px" className="text-indigo-500" />
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Get Hired
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From AI-powered content generation to beautiful templates,
              Resumify has all the tools to make your resume shine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "AI Content Generation",
                description:
                  "Generate professional summaries and bullet points tailored to your role with a single click.",
                gradient: "from-indigo-500 to-blue-500",
              },
              {
                icon: Palette,
                title: "Custom Theme Colors",
                description:
                  "Personalize your resume with a curated palette of professional color themes.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Download,
                title: "Export to PDF",
                description:
                  "Download your polished resume as a high-quality PDF, ready to submit anywhere.",
                gradient: "from-cyan-500 to-blue-500",
              },
              {
                icon: Share2,
                title: "Shareable Links",
                description:
                  "Share your resume with a unique link — perfect for portfolios and applications.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Shield,
                title: "ATS-Optimized",
                description:
                  "Our templates are designed to pass Applicant Tracking Systems with flying colors.",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: Zap,
                title: "Real-Time Preview",
                description:
                  "See changes instantly as you type with our live preview panel.",
                gradient: "from-yellow-500 to-orange-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card premium-card"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon size="22px" className="text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
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
                description: "Enter your personal info, experience, education, and skills using our intuitive form wizard.",
              },
              {
                step: "02",
                title: "Let AI Enhance It",
                description: "Our AI generates professional summaries and work descriptions tailored to your industry.",
              },
              {
                step: "03",
                title: "Download & Share",
                description: "Export as PDF or share with a unique link. Your resume is ready to land interviews.",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center p-8 rounded-2xl border border-border/50 bg-card/30 glass">
                <div className="text-6xl font-black text-indigo-500/10 mb-4">{item.step}</div>
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
                Join thousands of professionals who&apos;ve landed their dream jobs
                with Resumify. Start building in seconds.
              </p>
              <div className="mt-8">
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-base font-semibold bg-white text-indigo-600 hover:bg-white/90 shadow-xl shadow-black/20 transition-all duration-300 gap-2 rounded-xl"
                  >
                    Start Building for Free
                    <ArrowRight size="16px" />
                  </Button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border/50 py-12 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText size="14px" className="text-white" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Resumify
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Resumify. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
