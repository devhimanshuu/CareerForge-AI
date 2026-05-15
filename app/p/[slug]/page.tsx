"use client";

import React, { useEffect, useState, Fragment } from "react";
import { useParams } from "next/navigation";
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Download,
  Share2,
  ChevronRight,
  ExternalLink,
  Award,
  Briefcase,
  GraduationCap,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PublicPortfolio = () => {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch(`/api/document/public/slug/${slug}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Portfolio not found");
        }
      } catch (err) {
        setError("Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPortfolio();
    }
  }, [slug]);

  if (loading) return <PortfolioSkeleton />;
  if (error || !data) return <PortfolioError message={error} />;

  const template = data.template || "modern";

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: data.documentId }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.personalInfo?.firstName}_${data.personalInfo?.lastName}_Resume.pdf`;
      a.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // show toast or feedback if possible, but for public page let's just copy
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full selection:bg-indigo-500/30",
        template === "dark" && "bg-slate-950 text-slate-100",
        template === "glassmorphic" && "bg-[#030014] text-white",
        template === "modern" && "bg-white text-slate-900",
      )}
    >
      {template === "glassmorphic" && <GlassmorphicBackground />}

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 relative z-10">
        {/* Header Section */}
        <header className="mb-16 md:mb-24 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={12} />
              Available for Hire
            </div>
            <h1
              className={cn(
                "text-5xl md:text-7xl font-black tracking-tight",
                template === "glassmorphic" &&
                  "bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent",
              )}
            >
              {data.personalInfo?.firstName} {data.personalInfo?.lastName}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              {data.personalInfo?.jobTitle}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <ContactItem
                icon={<Mail size={16} />}
                label={data.personalInfo?.email}
              />
              <ContactItem
                icon={<Phone size={16} />}
                label={data.personalInfo?.phone}
              />
              <ContactItem
                icon={<MapPin size={16} />}
                label={data.personalInfo?.address}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="rounded-full gap-2 px-8 font-bold shadow-xl shadow-indigo-500/20"
              onClick={handleDownload}
            >
              <Download size={18} />
              Download PDF
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-12 w-12 p-0 border-white/10 bg-white/5 backdrop-blur-md"
              onClick={handleCopyLink}
            >
              <Share2 size={18} />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-20">
            {/* Summary */}
            <section className="space-y-6">
              <SectionHeading
                icon={<Layers size={20} />}
                title="Professional Summary"
              />
              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                {data.summary}
              </p>
            </section>

            {/* Experience */}
            <section className="space-y-10">
              <SectionHeading
                icon={<Briefcase size={20} />}
                title="Work Experience"
              />
              <div className="space-y-12">
                {data.experiences?.map((exp: any, i: number) => (
                  <div
                    key={i}
                    className="group relative pl-8 border-l border-white/10"
                  >
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h3 className="text-xl font-bold">{exp.title}</h3>
                        <span className="text-sm font-bold px-3 py-1 rounded-md bg-white/5 text-muted-foreground">
                          {exp.startDate} —{" "}
                          {exp.currentlyWorking ? "Present" : exp.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                        {exp.companyName}, {exp.city}, {exp.state}
                      </div>
                      <div
                        className="text-muted-foreground leading-relaxed prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: exp.workSummary }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-16">
            {/* Skills */}
            <section className="space-y-6">
              <SectionHeading
                icon={<Award size={20} />}
                title="Core Expertise"
              />
              <div className="flex flex-wrap gap-2">
                {data.skills?.map((skill: any, i: number) => (
                  <div
                    key={i}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-default"
                  >
                    {skill.name}
                    <div className="mt-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${skill.rating * 20}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="space-y-6">
              <SectionHeading
                icon={<GraduationCap size={20} />}
                title="Education"
              />
              <div className="space-y-6">
                {data.educations?.map((edu: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-bold">{edu.universityName}</h4>
                    <p className="text-sm text-indigo-400 font-semibold">
                      {edu.degree} in {edu.major}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {edu.startDate} — {edu.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Social Links */}
            <section className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
              <h4 className="font-bold text-sm">Connect with me</h4>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start gap-3 text-muted-foreground hover:text-white hover:bg-white/5"
                >
                  <Linkedin size={18} />
                  LinkedIn Profile
                  <ExternalLink size={12} className="ml-auto opacity-30" />
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start gap-3 text-muted-foreground hover:text-white hover:bg-white/5"
                >
                  <Globe size={18} />
                  Personal Website
                  <ExternalLink size={12} className="ml-auto opacity-30" />
                </Button>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-muted-foreground text-sm">
          <p>
            © {new Date().getFullYear()} {data.personalInfo?.firstName}{" "}
            {data.personalInfo?.lastName}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            Built with{" "}
            <span className="text-indigo-500 font-bold">Resumify AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

const ContactItem = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <span className="text-indigo-500/50">{icon}</span>
    {label}
  </div>
);

const SectionHeading = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
      {icon}
    </div>
    <h2 className="text-2xl font-bold tracking-tight uppercase  lg:text-sm">
      {title}
    </h2>
  </div>
);

const GlassmorphicBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
    <div
      className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"
      style={{ animationDelay: "2s" }}
    />
    <div className="absolute top-[40%] right-[20%] w-[100px] h-[100px] bg-indigo-500/20 rounded-full blur-[40px]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
  </div>
);

const PortfolioSkeleton = () => (
  <div className="min-h-screen bg-slate-950 p-20 flex flex-col items-center">
    <div className="w-full max-w-5xl space-y-12">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32 bg-slate-900" />
        <Skeleton className="h-20 w-3/4 bg-slate-900" />
        <Skeleton className="h-6 w-1/2 bg-slate-900" />
      </div>
      <div className="grid grid-cols-3 gap-16">
        <div className="col-span-2 space-y-12">
          <Skeleton className="h-40 w-full bg-slate-900" />
          <Skeleton className="h-80 w-full bg-slate-900" />
        </div>
        <Skeleton className="h-96 w-full bg-slate-900" />
      </div>
    </div>
  </div>
);

const PortfolioError = ({ message }: { message: string | null }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-6">
    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
      <Globe size={40} />
    </div>
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-white">Portfolio Unavailable</h1>
      <p className="text-slate-400 max-w-md">
        {message ||
          "The portfolio you are looking for doesn&apos;t exist or is set to private."}
      </p>
    </div>
    <Button variant="outline" className="border-white/10 bg-white/5" asChild>
      <a href="/">Back to Resumify</a>
    </Button>
  </div>
);

export default PublicPortfolio;
