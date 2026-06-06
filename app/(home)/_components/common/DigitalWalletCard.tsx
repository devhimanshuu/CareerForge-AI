"use client";

import React, { useState, useRef } from "react";
import { Smartphone, Download, Share2, Sparkles, QrCode, CreditCard, ChevronRight, X, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const DigitalWalletCard = () => {
  const { resumeInfo } = useResumeContext();
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${resumeInfo?.personalInfo?.firstName || "Resume"}_Wallet_Card.png`;
      link.click();
      toast({
        title: "Card Saved",
        description: "Your digital wallet card has been downloaded as a high-res PNG.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Download Failed",
        description: "Could not render the card to image.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!resumeInfo) return;
    const shareUrl = `${window.location.origin}/p/${resumeInfo.documentId}/share`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${resumeInfo.personalInfo?.firstName}'s Professional Card`,
          text: `Check out my digital portfolio card!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Public portfolio link copied to clipboard.",
      });
    }
  };

  const handleAddToWallet = (provider: "Apple" | "Google") => {
    toast({
      title: `${provider} Wallet Sync`,
      description: `Synchronizing card details with ${provider} Wallet. Generating digital pass...`,
    });
    setTimeout(handleDownload, 800);
  };

  if (!resumeInfo) return null;

  return (
    <div className="relative group">
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        className="w-8 h-8 rounded-lg text-slate-400 hover:text-white"
      >
        <Smartphone size={16} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-8">
                    <div className="flex items-center gap-3">
                        <CreditCard size={20} className="text-indigo-400" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Digital Wallet Card</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* The Virtual Card */}
                <motion.div
                    ref={cardRef}
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="relative w-full aspect-[1.586/1] rounded-[2rem] bg-gradient-to-br from-slate-900 to-black border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] p-8 overflow-hidden group/card"
                >
                    {/* Animated Glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(99,102,241,0.15)_0%,transparent_50%)] pointer-events-none" />
                    
                    {/* Chip & NFC Logo */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 opacity-80" />
                        <div className="flex flex-col items-end gap-1 opacity-40">
                            <div className="w-6 h-px bg-white" />
                            <div className="w-4 h-px bg-white" />
                            <div className="w-2 h-px bg-white" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-2xl font-black text-white tracking-tighter italic">
                            {resumeInfo.personalInfo?.firstName} {resumeInfo.personalInfo?.lastName}
                        </h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                            {resumeInfo.personalInfo?.jobTitle}
                        </p>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Digital ID</p>
                            <p className="text-[10px] font-mono text-white opacity-60">CF-842-{resumeInfo.documentId?.slice(-4).toUpperCase()}</p>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg p-1">
                            <QrCode className="w-full h-full text-slate-900" />
                        </div>
                    </div>
                </motion.div>

                {/* Wallet Options */}
                <div className="mt-12 w-full space-y-4">
                    <Button 
                        onClick={() => handleAddToWallet("Apple")}
                        className="w-full h-14 rounded-2xl bg-black text-white border border-white/10 flex items-center justify-center gap-3 hover:bg-slate-900 shadow-xl"
                    >
                        <Smartphone size={20} />
                        Add to Apple Wallet
                    </Button>
                    <Button 
                        onClick={() => handleAddToWallet("Google")}
                        className="w-full h-14 rounded-2xl bg-slate-100 text-slate-950 flex items-center justify-center gap-3 hover:bg-white shadow-xl"
                    >
                        <Smartphone size={20} className="text-indigo-600" />
                        Add to Google Wallet
                    </Button>
                </div>

                <div className="mt-8 flex items-center gap-6">
                    <button 
                        onClick={handleShare}
                        className="flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Share2 size={16} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Share Card</span>
                    </button>
                    <button 
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            {downloading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <Download size={16} />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Save Image</span>
                    </button>
                </div>

                <div className="mt-12 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 max-w-xs text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Sparkles size={12} className="text-indigo-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">NFC Enabled</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        &quot;Your resume is now instant. Share your contact info and full digital portfolio with a single tap at events.&quot;
                    </p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DigitalWalletCard;
