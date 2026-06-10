"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative border-b border-border/40 bg-gradient-to-b from-indigo-500/[0.03] to-transparent">
        <div className="max-w-4xl mx-auto px-5 pt-28 pb-12 sm:pt-32 sm:pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-indigo-500 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
              <Shield className="text-indigo-500" size={28} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3">
                Privacy Policy
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
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-12">
            {/* Introduction */}
            <div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                CareerForge AI (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                use our platform, including our website, resume builder, interview coach, job application tracker,
                and all related services (collectively, the &ldquo;Service&rdquo;).
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                By accessing or using the Service, you agree to the terms outlined in this Privacy Policy. If you
                do not agree, please discontinue use of the Service immediately.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">1.1 Information You Provide Directly</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  <strong className="text-foreground">Account Data:</strong> When you register, we collect your
                  name, email address, and authentication credentials via Clerk. We never store raw passwords;
                  authentication is fully delegated to Clerk&rsquo;s secure identity platform.
                </li>
                <li>
                  <strong className="text-foreground">Resume Content:</strong> All information you input into the
                  resume builder — including work history, education, skills, contact details, and any uploaded
                  documents — is stored securely and encrypted at rest.
                </li>
                <li>
                  <strong className="text-foreground">Job Application Data:</strong> When you use our job tracking
                  features, we store job URLs, application statuses, notes, and related metadata.
                </li>
                <li>
                  <strong className="text-foreground">Communication Data:</strong> If you contact our support team,
                  we retain email correspondence, chat logs, and any attachments you share.
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">1.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  <strong className="text-foreground">Usage Analytics:</strong> We use PostHog for anonymous
                  product analytics including page views, feature usage, session duration, and interaction events.
                  This data is pseudonymized and never linked to identifiable resume content.
                </li>
                <li>
                  <strong className="text-foreground">Device & Browser Data:</strong> We collect browser type,
                  operating system, device type, IP address (anonymized), and referring URLs for security and
                  analytics purposes.
                </li>
                <li>
                  <strong className="text-foreground">Performance Metrics:</strong> We monitor application
                  performance including page load times, API latency, and error rates using Vercel Analytics
                  to ensure service reliability.
                </li>
                <li>
                  <strong className="text-foreground">Cookies & Similar Technologies:</strong> We use
                  essential cookies for authentication (via Clerk), and optional analytics cookies. See our{" "}
                  <Link href="/cookies" className="text-indigo-500 hover:text-indigo-600 underline">
                    Cookie Policy
                  </Link>{" "}
                  for details.
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  <strong className="text-foreground">Service Delivery:</strong> To generate AI-optimized resumes,
                  provide ATS score analysis, generate podcast audio summaries, and facilitate mock interview
                  sessions via our LangChain and ElevenLabs integrations.
                </li>
                <li>
                  <strong className="text-foreground">AI Processing:</strong> Your resume content is processed
                  through Groq&rsquo;s LLM inference API to generate tailored bullet points, keyword suggestions,
                  and career insights. Data is transmitted over encrypted channels and is not used to train
                  third-party models per Groq&rsquo;s data usage policies.
                </li>
                <li>
                  <strong className="text-foreground">Personalization:</strong> To tailor your experience
                  including recommended templates, relevant job matches, and personalized feedback.
                </li>
                <li>
                  <strong className="text-foreground">Communication:</strong> To send transactional emails
                  (account notifications, billing receipts) and, with your consent, product updates and tips.
                </li>
                <li>
                  <strong className="text-foreground">Security & Compliance:</strong> To detect and prevent
                  fraudulent activity, enforce our Terms of Service, and comply with legal obligations.
                </li>
                <li>
                  <strong className="text-foreground">Product Improvement:</strong> Aggregated, anonymized
                  data helps us understand feature adoption, identify usability issues, and prioritize roadmap
                  items.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">3. How We Share Your Data</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                We do <strong>not</strong> sell, rent, or trade your personal information. We share data only
                in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  <strong className="text-foreground">Service Providers:</strong> We engage trusted third-party
                  processors bound by data processing agreements (DPAs) — including Clerk (authentication),
                  Vercel (hosting), Neon (database), Groq (AI inference), ElevenLabs (voice synthesis),
                  PostHog (analytics), and Liveblocks (collaboration).
                </li>
                <li>
                  <strong className="text-foreground">Legal Compliance:</strong> We may disclose information
                  if required by law, subpoena, court order, or governmental regulation.
                </li>
                <li>
                  <strong className="text-foreground">Business Transfers:</strong> In the event of a merger,
                  acquisition, or asset sale, your data may be transferred as part of the transaction with
                  appropriate safeguards.
                </li>
                <li>
                  <strong className="text-foreground">With Your Consent:</strong> We may share data for any
                  other purpose with your explicit consent.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">4. Data Retention & Deletion</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  <strong className="text-foreground">Account Data:</strong> Retained for the duration of your
                  account. You may request deletion at any time through your account settings or by contacting
                  our support team.
                </li>
                <li>
                  <strong className="text-foreground">Resume Content:</strong> Your resumes remain private and
                  are only accessible via a cryptographically hashed <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">pdfSecret</code> token during PDF
                  generation through our Puppeteer print engine. Content is permanently deleted upon account
                  termination.
                </li>
                <li>
                  <strong className="text-foreground">Analytics Data:</strong> Pseudonymized analytics data
                  is retained for up to 24 months for trend analysis.
                </li>
                <li>
                  <strong className="text-foreground">Backup Archives:</strong> Encrypted database backups
                  are retained for 30 days per our disaster recovery protocol.
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">5. Data Security</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li><strong className="text-foreground">Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256).</li>
                <li><strong className="text-foreground">Authentication:</strong> We use Clerk&rsquo;s enterprise-grade authentication with multi-factor authentication (MFA) support.</li>
                <li><strong className="text-foreground">Infrastructure Security:</strong> Our application is hosted on Vercel&rsquo;s secure edge network with DDoS protection, WAF rules, and automatic security patches.</li>
                <li><strong className="text-foreground">Database Security:</strong> Neon provides isolated compute environments with IP allowlisting, connection pooling, and automated backups.</li>
                <li><strong className="text-foreground">Access Controls:</strong> Internal access to production data is strictly limited, logged, and requires multi-factor authentication.</li>
                <li><strong className="text-foreground">Penetration Testing:</strong> We conduct regular security assessments and vulnerability scans.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">6. Your Rights & Choices</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Depending on your jurisdiction (including GDPR for EU/EEA residents and CCPA for California
                residents), you may have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong className="text-foreground">Rectification:</strong> Correct any inaccurate or incomplete data.</li>
                <li><strong className="text-foreground">Erasure:</strong> Request deletion of your account and associated data (&ldquo;right to be forgotten&rdquo;).</li>
                <li><strong className="text-foreground">Portability:</strong> Receive your data in a structured, machine-readable format.</li>
                <li><strong className="text-foreground">Objection:</strong> Object to certain processing activities, including direct marketing.</li>
                <li><strong className="text-foreground">Withdraw Consent:</strong> Withdraw previously given consent at any time.</li>
              </ul>
              <p className="text-base text-muted-foreground leading-relaxed mt-4">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:privacy@careerforge.ai" className="text-indigo-500 hover:text-indigo-600 underline">
                  privacy@careerforge.ai
                </a>
                . We will respond within 30 days as required by applicable law.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">7. Children&rsquo;s Privacy</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                The Service is not directed to individuals under the age of 16. We do not knowingly collect
                personal information from children. If we become aware that a child under 16 has provided us
                with personal data, we will take steps to delete such information immediately.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">8. International Data Transfers</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Your data may be transferred to and processed in countries outside your country of residence,
                including the United States where our primary infrastructure (Vercel, Neon) is hosted. We
                ensure adequate safeguards through Standard Contractual Clauses (SCCs) and Data Processing
                Agreements with all subprocessors.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">9. Changes to This Policy</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. Material changes will be communicated
                via email and/or an in-app notification at least 14 days before taking effect. Continued
                use of the Service after changes become effective constitutes acceptance of the revised policy.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">10. Contact Us</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="p-6 rounded-2xl border border-border/50 bg-card/30 glass space-y-3">
                <p className="text-sm text-foreground font-medium">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@careerforge.ai" className="text-indigo-500 hover:text-indigo-600 underline">
                    privacy@careerforge.ai
                  </a>
                </p>
                <p className="text-sm text-foreground font-medium">
                  <strong>Data Protection Officer:</strong> Himanshu Gupta
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