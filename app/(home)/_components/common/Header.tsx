"use client";
import React from "react"; // Rebuild trigger
import Link from "next/link";
import {
  Moon,
  Sun,
  Monitor,
  BarChart3,
  Briefcase,
  LayoutDashboard,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/applications",
    label: "Job Tracker",
    icon: Briefcase,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
];


const Header = () => {
  const { setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  return (
    <header className="w-full sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="w-full mx-auto max-w-7xl 3xl:max-w-9xl 4xl:max-w-10xl py-0 px-5 flex items-center justify-between h-14">
        {/* Left Section: Logo + Nav */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="relative">
              <Image
                src="/logo.svg"
                alt="CareerForge AI Logo"
                width={28}
                height={28}
                className="group-hover:scale-105 transition-transform duration-300 rounded-lg"
              />
            </div>
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              CareerForge AI
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-border/60" />

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "text-foreground bg-muted/70"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                >
                  <Icon size={14} />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(50%+6px)] w-6 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Greeting + Actions */}
        <div className="flex items-center gap-3">
          {/* Welcome message */}
          {isLoaded && user ? (
            <div className="hidden lg:flex items-center gap-2 mr-1">
              <span className="text-xs text-muted-foreground">Welcome,</span>
              <span className="text-xs font-semibold text-foreground">
                {user?.firstName}
              </span>
            </div>
          ) : null}

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all"
              >
                <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[140px] rounded-xl border-border/50"
            >
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="gap-2 text-xs rounded-lg"
              >
                <Sun size="14px" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="gap-2 text-xs rounded-lg"
              >
                <Moon size="14px" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="gap-2 text-xs rounded-lg"
              >
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
                avatarBox:
                  "w-8 h-8 ring-2 ring-border/30 ring-offset-1 ring-offset-background",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
