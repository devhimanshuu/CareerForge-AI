"use client";
import React from "react";
import Link from "next/link";
import { FileText, Moon, Sun, Monitor } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

import Image from "next/image";

const Header = () => {
  const { setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  return (
    <header className="w-full sticky top-0 z-[9] glass border-b border-border/50">
      <div className="w-full mx-auto max-w-7xl py-2.5 px-5 flex items-center justify-between">
        {/* Logo + Greeting */}
        <div className="flex items-center flex-1 gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group"
          >
            <Image
              src="/logo.svg"
              alt="Resumify Logo"
              width={32}
              height={32}
              className="shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all duration-300 rounded-lg"
            />
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Resumify
            </span>
          </Link>

          {isLoaded && user ? (
            <div className="hidden md:flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">
                Welcome back,
              </span>
              <span className="font-semibold text-foreground">
                {user?.firstName}
              </span>
              <span className="text-lg">👋</span>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-lg hover:bg-muted"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                <Sun size="14px" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                <Moon size="14px" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
                <Monitor size="14px" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Button */}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
