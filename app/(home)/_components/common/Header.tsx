"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Moon,
  Sun,
  Monitor,
  BarChart3,
  Briefcase,
  LayoutDashboard,
  Mic,
  Globe,
  Map,
  Bot,
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
    href: "/dashboard/interview",
    label: "Interview Lab",
    icon: Mic,
  },
  {
    href: "/dashboard/market",
    label: "Market Data",
    icon: Globe,
  },
  {
    href: "/dashboard/roadmap",
    label: "Roadmap",
    icon: Map,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/dashboard/automation",
    label: "Agents",
    icon: Bot,
  },
];

const Header = () => {
  const { setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const currentPath = pathname || "";
  const [agentAlerts, setAgentAlerts] = useState(0);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await fetch("/api/automation/insights");
        if (!response.ok) return;
        const data = await response.json();
        const count = (data.insights || []).filter((item: { status: string }) => item.status === "new").length;
        setAgentAlerts(count);
      } catch {
        setAgentAlerts(0);
      }
    };
    loadAlerts();
    const interval = window.setInterval(loadAlerts, 60000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Logo + Nav */}
        <div className="flex min-w-0 items-center gap-6 overflow-hidden">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="relative">
              <Image
                src="/CareerForge_ai_final.png"
                alt="CareerForge AI Logo"
                width={32}
                height={32}
                className="group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              />
            </div>
            <span className="hidden font-display font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent sm:block">
              CareerForge AI
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-border/60 shrink-0" />

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto min-w-0 scrollbar-none py-1">
            {navItems.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href !== "/dashboard" && currentPath.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold shrink-0
                    transition-[background-color,color,box-shadow,transform] duration-300 ease-out
                    hover:transition-[transform] hover:duration-300 hover:[transitionTimingFunction:cubic-bezier(0.34,1.56,0.64,1)]
                    ${
                      isActive
                        ? "bg-foreground text-background shadow-sm scale-100"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-[1.04] active:scale-95"
                    }
                  `}
                >
                  <Icon
                    size={14}
                    className={`transition-transform duration-300 ${
                      isActive
                        ? "scale-110 -rotate-6 [transitionTimingFunction:cubic-bezier(0.34,1.56,0.64,1)]"
                        : "group-hover:rotate-12 [transitionTimingFunction:cubic-bezier(0.34,1.56,0.64,1)]"
                    }`}
                  />
                  {item.label}
                  {item.href === "/dashboard/automation" && agentAlerts > 0 && (
                    <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white animate-pulse">
                      {agentAlerts}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-[13px] left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-indigo-500 animate-[slideIn_0.3s_ease-out_forwards]" />
                  )}
                  {!isActive && (
                    <span className="absolute -bottom-[13px] left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-indigo-500 transition-all duration-300 group-hover:w-4" />
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
