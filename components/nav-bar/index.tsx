"use client";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  FileText,
  ArrowRight,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavBar = () => {
  const { setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ease-out ${
        isScrolled
          ? "mx-auto mt-4 max-w-[720px] rounded-full shadow-2xl shadow-indigo-500/10 glass-premium"
          : "w-full rounded-none shadow-none glass-flat"
      }`}
    >
      <div
        className={`w-full mx-auto flex items-center justify-between transition-all duration-500 ease-out ${
          isScrolled
            ? "max-w-[700px] px-6 py-2.5"
            : "max-w-7xl px-5 py-3"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/CareerForge_ai_final.png"
            alt="CareerForge AI Logo"
            width={38}
            height={38}
            className="group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)] rounded-lg"
            style={{ mixBlendMode: "multiply" }}
          />
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
            CareerForge AI
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden lg:flex">
          <ul className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <li>
              <Link
                href="#features"
                className="hover:text-foreground transition-colors duration-200"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="#how-it-works"
                className="hover:text-foreground transition-colors duration-200"
              >
                How it Works
              </Link>
            </li>
            <li>
              <Link
                href="#pricing"
                className="hover:text-foreground transition-colors duration-200"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 transition-all"
              >
                <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[140px] rounded-2xl border-border/50 glass shadow-2xl p-1.5"
            >
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="gap-2.5 text-xs font-bold uppercase tracking-widest rounded-xl px-3 py-2 cursor-pointer"
              >
                <Sun size="14px" className="text-amber-500" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="gap-2.5 text-xs font-bold uppercase tracking-widest rounded-xl px-3 py-2 cursor-pointer"
              >
                <Moon size="14px" className="text-indigo-400" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="gap-2.5 text-xs font-bold uppercase tracking-widest rounded-xl px-3 py-2 cursor-pointer"
              >
                <Monitor size="14px" className="text-slate-400" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Button
              asChild
              className="text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 gap-1.5 rounded-xl px-5"
            >
              <Link href="/sign-up">
                <Sparkles size="14px" />
                <span className="hidden sm:inline">Get Started Free</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;