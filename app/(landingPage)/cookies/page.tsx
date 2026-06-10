"use client";

import Link from "next/link";
import { Cookie, ArrowLeft, Shield, CheckCircle2, X } from "lucide-react";

export default function CookiePolicyPage() {
  const cookiesData = [
    {
      category: "Essential Cookies",
      purpose: "Required for core platform functionality and security. These cannot be disabled.",
      cookies: [
        { name: "__session", provider: "CareerForge AI", duration: "Session", description: "Maintains your authenticated session state for seamless navigation." },
        { name: "__clerk_db_jwt", provider: "Clerk", duration: "Session", description: "Authentication token managed by Clerk for secure identity verification." },
        { name: "__client_uat", provider: "Clerk", duration: "Session", description: "Clerk user authentication token for client-side session management." },
        { name: "cf_clearance", provider: "Vercel / Cloudflare", duration: "30 minutes", description: "Security clearance cookie for bot detection and DDoS protection." },
      ],
      required: true,
    },
    {
      category: "Functional Cookies",
      purpose: "Enable enhanced functionality and personalization. Disabling may affect some features.",
      cookies: [
        { name: "theme", provider: "CareerForge AI", duration: "Persistent", description: "Stores your preferred theme setting (light, dark, or system)." },
        { name: "resume_preview_layout", provider: "CareerForge AI", duration: "Persistent", description: "Remembers your preferred resume preview layout configuration." },
        { name: "editor_preferences", provider: "CareerForge AI", duration: "Persistent", description: "Stores editor preferences including font size, spacing, and toolbar position." },
      ],
      required: false,
    },
    {
      category: "Analytics Cookies",
      purpose: "Help us understand how you use the platform so we can improve the experience.",
      cookies: [
        { name: "ph_*", provider: "PostHog", duration: "Up to 12 months", description: "Anonymous usage analytics including feature adoption, session recordings, and interaction patterns. Pseudonymized — never linked to your resume content." },
        { name: "_vercel_insights", provider: "Vercel", duration: "Session", description: "Anonymous performance metrics for page load times, API latency, and error tracking." },
      ],
      required: false,
    },
    {
      category: "Performance Cookies",
      purpose: "Monitor and optimize platform performance and reliability.",
      cookies: [
        { name: "_vercel_speed_insights", provider: "Vercel", duration: "Session", description: "Real user monitoring (RUM) for Core Web Vitals and page speed metrics." },
        { name: "lb_route", provider: "Vercel / Load Balancer", duration: "Session", description: "Routes your requests to the optimal server instance for low latency." },
      ],
      required: false,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative border-b border-border/40 bg-gradient-to-b from-amber-500/[0.03] to-transparent">
        <div className="max-w-4xl mx-auto px-5 pt-28 pb-12 sm:pt-32 sm:pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-indigo-500 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shrink-0">
              <Cookie className="text-amber-500" size={28} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3">
                Cookie Policy
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Last updated: June 10, 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {/* Introduction */}
            <div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                This Cookie Policy explains how CareerForge AI ("we," "our," or "us") uses cookies
                and similar tracking technologies on our website and platform (the "Service"). By
                continuing to browse or use the Service, you consent to our use of cookies as described
                in this policy.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                For more information about how we handle your personal data, please review our{" "}
                <Link href="/privacy" className="text-indigo-500 hover:text-indigo-600 underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* What Are Cookies */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">1. What Are Cookies?</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Cookies are small text files that are placed on your device (computer, smartphone, or tablet)
                when you visit a website. They are widely used to make websites work efficiently, provide
                reporting information, and enhance the user experience.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                In addition to cookies, we may use similar technologies such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  <strong className="text-foreground">Local Storage:</strong> Browser storage that persists
                  data locally on your device for preferences and caching.
                </li>
                <li>
                  <strong className="text-foreground">Session Storage:</strong> Temporary storage that is
                  cleared when you close your browser tab.
                </li>
                <li>
                  <strong className="text-foreground">Web Beacons / Tracking Pixels:</strong> Tiny
                  transparent images used to track page visits and email opens.
                </li>
              </ul>
              <p className="text-base text-muted-foreground leading-relaxed mt-4">
                Throughout this policy, we use the term "cookies" to refer to all such technologies.
              </p>
            </div>

            {/* Types of Cookies */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">2. Types of Cookies We Use</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                We categorize our cookies into four types based on their purpose and necessity:
              </p>

              <div className="space-y-6">
                {cookiesData.map((category, catIdx) => (
                  <div
                    key={catIdx}
                    className="p-6 rounded-2xl border border-border/50 bg-card/30 glass"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          {category.category}
                          {category.required && (
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-bold rounded-md uppercase tracking-wider">
                              Required
                            </span>
                          )}
                          {!category.required && (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold rounded-md uppercase tracking-wider">
                              Optional
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{category.purpose}</p>
                      </div>
                    </div>

                    {/* Cookie Table */}
                    <div className="overflow-x-auto -mx-6 sm:mx-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/40">
                            <th className="text-left py-3 px-3 sm:px-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                              Cookie Name
                            </th>
                            <th className="text-left py-3 px-3 sm:px-4 font-semibold text-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                              Provider
                            </th>
                            <th className="text-left py-3 px-3 sm:px-4 font-semibold text-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                              Duration
                            </th>
                            <th className="text-left py-3 px-3 sm:px-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                              Purpose
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.cookies.map((cookie, cIdx) => (
                            <tr key={cIdx} className="border-b border-border/20 last:border-0">
                              <td className="py-3 px-3 sm:px-4">
                                <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-foreground">
                                  {cookie.name}
                                </code>
                              </td>
                              <td className="py-3 px-3 sm:px-4 text-muted-foreground hidden sm:table-cell">
                                {cookie.provider}
                              </td>
                              <td className="py-3 px-3 sm:px-4 text-muted-foreground hidden sm:table-cell">
                                {cookie.duration}
                              </td>
                              <td className="py-3 px-3 sm:px-4 text-muted-foreground text-xs leading-relaxed">
                                {cookie.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Control */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">3. How to Control Cookies</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                You have the right to decide whether to accept or reject cookies. You can manage your cookie
                preferences in several ways:
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">3.1 Browser Settings</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Most web browsers allow you to control cookies through their settings preferences. You can
                set your browser to refuse all cookies, accept only certain cookies, or alert you when a
                website attempts to set a cookie. Instructions for popular browsers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                <li><strong className="text-foreground">Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                <li><strong className="text-foreground">Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong className="text-foreground">Apple Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong className="text-foreground">Microsoft Edge:</strong> Settings → Site permissions → Cookies and site data</li>
              </ul>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                Please note that disabling essential cookies may prevent you from logging in or using core
                features of the Service.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">3.2 Opting Out of Analytics</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                You can opt out of PostHog analytics tracking by enabling "Do Not Track" in your browser
                settings, or by contacting us at{" "}
                <a href="mailto:privacy@careerforge.ai" className="text-indigo-500 hover:text-indigo-600 underline">
                  privacy@careerforge.ai
                </a>
                .
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">3.3 Our Cookie Consent Banner</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                On your first visit to CareerForge AI, you will be presented with a cookie consent banner
                allowing you to accept or customize your cookie preferences. You can change your preferences
                at any time by clearing your browser cookies and revisiting the site, or through your
                account privacy settings.
              </p>
            </div>

            {/* Third-Party Cookies */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">4. Third-Party Cookies</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Some cookies are placed by third-party services integrated into our platform. These services
                have their own privacy and cookie policies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                <li>
                  <strong className="text-foreground">Clerk:</strong> Authentication cookies for secure
                  identity management. See{" "}
                  <a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 underline">
                    Clerk's Privacy Policy
                  </a>
                  .
                </li>
                <li>
                  <strong className="text-foreground">PostHog:</strong> Product analytics cookies for
                  understanding user behavior. See{" "}
                  <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 underline">
                    PostHog's Privacy Policy
                  </a>
                  .
                </li>
                <li>
                  <strong className="text-foreground">Vercel:</strong> Hosting and performance monitoring.
                  See{" "}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 underline">
                    Vercel's Privacy Policy
                  </a>
                  .
                </li>
              </ul>
              <p className="text-base text-muted-foreground leading-relaxed">
                We do not control these third-party cookies and are not responsible for their practices.
              </p>
            </div>

            {/* Updates */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">5. Updates to This Policy</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or
                applicable law. The "Last updated" date at the top of this page indicates when the most
                recent changes were made. We encourage you to review this policy periodically.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="p-6 rounded-2xl border border-border/50 bg-card/30 glass space-y-3">
                <p className="text-sm text-foreground font-medium">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@careerforge.ai" className="text-indigo-500 hover:text-indigo-600 underline">
                    privacy@careerforge.ai
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  CareerForge AI — The Ultimate AI-Powered Career Suite
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}