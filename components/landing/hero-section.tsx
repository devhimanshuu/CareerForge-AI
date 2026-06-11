"use client";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { FallingPattern } from "@/components/ui/falling-pattern";
import { TypewriterText } from "@/components/ui/typewriter-text";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[95vh] flex items-center justify-center bg-background overflow-hidden">
      {/* Falling Pattern Background */}
      <div className="absolute inset-0 z-0">
        <FallingPattern
          className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
          color="hsl(var(--primary))"
        />
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-[15%] w-72 h-72 bg-indigo-500/10 rounded-full blur-[120px] animate-float z-0" />
      <div
        className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-float z-0"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] z-0"
      />

      <div className="relative z-10 w-full flex flex-col items-center justify-center pt-20 pb-24 max-w-5xl mx-auto px-5 text-center">
        {/* Badge */}
        <div className="animate-fade-up mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium glass border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              AI-Powered Career Platform
            </span>
          </div>
        </div>

        {/* Heading with Typewriter */}
        <h1
          className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight animate-fade-up leading-[0.95]"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="text-foreground">Forge Your</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient py-2">
            <TypewriterText
              words={["Perfect Resume", "Dream Career", "Interview Skills", "Public Portfolio"]}
            />
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="mt-8 text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-up font-medium"
          style={{ animationDelay: "0.2s" }}
        >
          CareerForge AI brings together six specialized agents that optimize your resume, scrape jobs, coach you through interviews, and manage networking — so you land the right role without the grind.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 animate-fade-up"
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
          className="flex flex-col sm:flex-row items-center gap-6 mt-12 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex -space-x-3">
            {[
              "bg-gradient-to-br from-indigo-400 to-indigo-600",
              "bg-gradient-to-br from-purple-400 to-purple-600",
              "bg-gradient-to-br from-pink-400 to-pink-600",
              "bg-gradient-to-br from-cyan-400 to-cyan-600",
              "bg-gradient-to-br from-emerald-400 to-emerald-600",
            ].map((color, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-full ${color} border-2 border-background flex items-center justify-center text-white text-xs font-bold shadow-lg`}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            <div className="flex items-center gap-1 justify-center sm:justify-start">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size="14px"
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="font-semibold text-foreground">2,000+</span>{" "}
            professionals trust CareerForge
          </div>
        </div>
      </div>
    </section>
  );
}
