"use client";

import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="w-full min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative border-b border-border/40 bg-gradient-to-b from-purple-500/[0.03] to-transparent">
        <div className="max-w-4xl mx-auto px-5 pt-28 pb-12 sm:pt-32 sm:pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-indigo-500 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 shrink-0">
              <FileText className="text-purple-500" size={28} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3">
                Terms of Service
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
                Welcome to CareerForge AI. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use
                of the CareerForge AI platform, including our website, resume builder, interview coach, job
                application tracker, AI podcast generator, and all related features, content, and services
                (collectively, the &ldquo;Service&rdquo;), operated by CareerForge AI (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;).
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                By creating an account, accessing, or using the Service in any manner, you acknowledge that you
                have read, understood, and agree to be bound by these Terms. If you do not agree, you may not
                access or use the Service.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">1. Eligibility & Account Registration</h2>

              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">1.1 Eligibility</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                You must be at least 16 years of age to use the Service. By registering, you represent and
                warrant that you meet this age requirement and that all information you provide is accurate,
                current, and complete.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">1.2 Account Responsibility</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                You are solely responsible for maintaining the confidentiality of your account credentials
                and for all activities that occur under your account. You agree to notify us immediately of
                any unauthorized access or use of your account. CareerForge AI shall not be liable for any
                loss or damage arising from your failure to comply with this obligation.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">1.3 Authentication Provider</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Account authentication is provided by Clerk, Inc. By using the Service, you also agree to
                Clerk&rsquo;s terms of service and privacy policy. We do not store or have access to your raw
                authentication credentials.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">2. Service Description & License</h2>

              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">2.1 Service Features</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                The Service provides an AI-powered career platform including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                <li>AI-optimized resume builder with ATS-compatible templates</li>
                <li>Job description scraping and gap analysis</li>
                <li>AI-generated podcast audio summaries of resumes</li>
                <li>Mock interview simulations with voice synthesis</li>
                <li>Job application tracking and management</li>
                <li>Real-time collaborative editing via Liveblocks</li>
                <li>Portfolio and document management</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">2.2 License Grant</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive,
                non-transferable, revocable license to access and use the Service for your personal,
                non-commercial career development purposes. This license does not include any right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                <li>Resell, sublicense, or commercially exploit any part of the Service</li>
                <li>Copy, modify, or create derivative works of the Service&rsquo;s underlying code</li>
                <li>Use any data mining, scraping, or automated data extraction methods</li>
                <li>Bypass or circumvent any security features or access restrictions</li>
                <li>Use the Service to build a competing product or service</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">2.3 Service Modifications</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any feature or aspect of the Service
                at any time with reasonable notice. We will make commercially reasonable efforts to notify you
                of material changes that may affect your use of the Service.
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">3. Subscriptions & Billing</h2>

              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">3.1 Free Tier</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                We offer a free Starter tier with limited features as described on our pricing page. Free
                tier access is provided at our discretion and may be modified at any time.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">3.2 Paid Subscriptions</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Paid subscriptions (Pro and Executive tiers) are billed on a monthly or annual basis as
                selected during checkout. By subscribing, you authorize us to charge your payment method
                on a recurring basis until cancelled.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">3.3 Cancellation & Refunds</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                <li>You may cancel your subscription at any time through your account billing settings.</li>
                <li>Cancellation takes effect at the end of the current billing period — you retain access
                  to paid features until that date.</li>
                <li>We do not provide prorated refunds for partial billing periods, except where required
                  by applicable law.</li>
                <li>Refund requests within 7 days of a charge may be considered on a case-by-case basis by
                  contacting our support team.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">3.4 Price Changes</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                We reserve the right to adjust pricing with 30 days&rsquo; advance notice. Price changes will not
                affect your current billing period and will only apply upon renewal.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">4. User Content & Conduct</h2>

              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">4.1 Your Content</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                You retain all ownership rights to the content you create, upload, or store through the Service
                (&ldquo;User Content&rdquo;). By submitting User Content, you grant us a limited, worldwide, royalty-free
                license to host, store, process, and display your content solely for the purpose of providing
                the Service to you.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">4.2 Prohibited Conduct</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                <li>Upload content that is unlawful, defamatory, harassing, or violates third-party rights</li>
                <li>Use the Service to distribute malware, spam, phishing links, or other harmful code</li>
                <li>Attempt to gain unauthorized access to other users&rsquo; accounts or data</li>
                <li>Interfere with or disrupt the Service, servers, or networks connected to the Service</li>
                <li>Impersonate any person or entity, or falsely state your affiliation</li>
                <li>Use the AI features to generate illegal, harmful, or unethical content</li>
                <li>Exceed rate limits or engage in activities that degrade Service performance</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">4.3 Resume Privacy Controls</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                You control the visibility of your resumes. Resumes marked as &ldquo;private&rdquo; are not publicly
                accessible. PDF generation is secured through a cryptographically hashed token derived from
                our application secret key. You are responsible for configuring appropriate privacy settings.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">5. AI-Generated Content Disclaimer</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                The Service uses artificial intelligence models (including Groq&rsquo;s LLM API via LangChain, and
                ElevenLabs for voice synthesis) to generate resume content, bullet points, interview responses,
                and audio summaries. You acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li>AI-generated content is provided as a suggestion only and may contain inaccuracies,
                  omissions, or inappropriate suggestions.</li>
                <li>You are solely responsible for reviewing, editing, and approving all AI-generated content
                  before use in any application, submission, or professional context.</li>
                <li>We make no warranties regarding the accuracy, completeness, or suitability of AI-generated
                  content for any particular purpose.</li>
                <li>AI models may produce different outputs for identical inputs; consistency is not guaranteed.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">6. Intellectual Property</h2>

              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">6.1 Our IP</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                The Service, including its original content, features, design, code, graphics, logos, and
                trademarks (&ldquo;CareerForge AI,&rdquo; the logo mark), are the exclusive intellectual property of
                CareerForge AI and are protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">6.2 Feedback</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Any feedback, suggestions, or ideas you provide regarding the Service may be used by us
                without restriction or obligation to compensate you. By submitting feedback, you assign all
                rights in such feedback to CareerForge AI.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">6.3 DMCA Compliance</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                We respect the intellectual property rights of others. If you believe your copyrighted work
                has been infringed through the Service, please contact us at{" "}
                <a href="mailto:legal@careerforge.ai" className="text-indigo-500 hover:text-indigo-600 underline">
                  legal@careerforge.ai
                </a>{" "}
                with a detailed description of the alleged infringement.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">7. Third-Party Services & Integrations</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                The Service integrates with and relies on various third-party services. Your use of these
                integrated services may be subject to their respective terms and policies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                <li><strong className="text-foreground">Clerk:</strong> Authentication and user management</li>
                <li><strong className="text-foreground">Groq:</strong> AI language model inference</li>
                <li><strong className="text-foreground">ElevenLabs:</strong> Voice synthesis for audio features</li>
                <li><strong className="text-foreground">Neon:</strong> Serverless PostgreSQL database</li>
                <li><strong className="text-foreground">Vercel:</strong> Application hosting and deployment</li>
                <li><strong className="text-foreground">Liveblocks:</strong> Real-time collaboration</li>
                <li><strong className="text-foreground">PostHog:</strong> Product analytics</li>
              </ul>
              <p className="text-base text-muted-foreground leading-relaxed">
                We are not responsible for the availability, content, or practices of any third-party services.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">8. Limitation of Liability</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                To the fullest extent permitted by applicable law, CareerForge AI and its officers, directors,
                employees, and agents shall not be liable for any indirect, incidental, special, consequential,
                or punitive damages, including but not limited to loss of profits, data, use, goodwill, or
                other intangible losses, resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                <li>Your use or inability to use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                <li>Errors, mistakes, or inaccuracies in AI-generated content</li>
                <li>Service interruptions, downtime, or data loss beyond our reasonable control</li>
              </ul>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Our aggregate liability for any claims arising from these Terms or your use of the Service
                shall not exceed the greater of (a) the total amount paid by you to CareerForge AI in the
                twelve (12) months preceding the claim, or (b) one hundred U.S. dollars ($100.00).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                Some jurisdictions do not allow the exclusion or limitation of certain damages. If these laws
                apply to you, some or all of the above limitations may not apply, and you may have additional
                rights.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">9. Indemnification</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless CareerForge AI, its affiliates, officers,
                directors, employees, and agents from and against any and all claims, damages, obligations,
                losses, liabilities, costs, and expenses (including reasonable attorneys&rsquo; fees) arising from:
                (a) your use of and access to the Service; (b) your violation of any term of these Terms;
                (c) your violation of any third-party right, including without limitation any privacy right
                or intellectual property right; or (d) any claim that your User Content caused damage to a
                third party.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">10. Termination</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior
                notice or liability, for any reason including, without limitation, breach of these Terms.
                Upon termination, your right to use the Service will immediately cease.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                If you wish to terminate your account, you may simply discontinue using the Service or delete
                your account through your account settings. All provisions of these Terms which by their
                nature should survive termination shall survive, including ownership provisions, warranty
                disclaimers, indemnity, and limitations of liability.
              </p>
            </div>

            {/* Section 11 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">11. Governing Law & Dispute Resolution</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of
                Delaware, United States, without regard to its conflict of law provisions. Any dispute arising
                out of or relating to these Terms or the Service shall be resolved through binding arbitration
                in accordance with the rules of the American Arbitration Association, with the arbitration
                to be held in Wilmington, Delaware.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                You agree that any dispute resolution proceedings will be conducted only on an individual basis
                and not in a class, consolidated, or representative action. You waive any right to a jury trial.
              </p>
            </div>

            {/* Section 12 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">12. Changes to Terms</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. Material changes will be communicated
                via email to registered users and/or through an in-app notification at least 30 days before
                taking effect. Your continued use of the Service after the effective date constitutes acceptance
                of the revised Terms. If you do not agree with the changes, you must discontinue use before
                they take effect.
              </p>
            </div>

            {/* Section 13 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">13. Contact</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="p-6 rounded-2xl border border-border/50 bg-card/30 glass space-y-3">
                <p className="text-sm text-foreground font-medium">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:legal@careerforge.ai" className="text-indigo-500 hover:text-indigo-600 underline">
                    legal@careerforge.ai
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