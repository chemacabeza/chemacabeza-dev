import { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
    title: "Privacy Policy",
    description:
        "Privacy Policy for chemacabeza.dev — learn how your data is collected, used, and protected.",
    path: "/privacy-policy",
});

const lastUpdated = "May 5, 2025";

const sections = [
    {
        title: "1. Information We Collect",
        content: [
            "This website does not require you to create an account or submit personal information to browse its content.",
            "We may collect the following types of information automatically when you visit:",
        ],
        list: [
            "Usage data — pages visited, time on page, referral source, and browser/device type.",
            "IP address — collected in anonymised form by analytics services.",
            "Cookies — small text files stored on your device to improve your browsing experience (see Section 3).",
        ],
    },
    {
        title: "2. How We Use Your Information",
        content: [
            "Any information collected is used solely for the following purposes:",
        ],
        list: [
            "To understand how visitors interact with this website and improve its content.",
            "To monitor and analyse website performance and uptime.",
            "To respond to enquiries submitted via the contact page or email.",
        ],
    },
    {
        title: "3. Cookies and Analytics",
        content: [
            "This website uses Vercel Analytics and Vercel Speed Insights to collect anonymised performance and usage data. These services may use cookies or similar technologies.",
            "We do not use advertising cookies or third-party tracking pixels. No data is sold to or shared with advertising networks.",
        ],
    },
    {
        title: "4. Third-Party Services",
        content: [
            "This website may link to or integrate with third-party services, including:",
        ],
        list: [
            "Vercel — hosting and deployment.",
            "GitHub — source code hosting and issue tracking.",
            "Calendly — meeting scheduling.",
            "Stripe — payment processing for the LoRA Marketplace.",
        ],
        footer:
            "Each third-party service operates under its own privacy policy. We encourage you to review their policies independently.",
    },
    {
        title: "5. Data Retention",
        content: [
            "Anonymised analytics data is retained for up to 12 months. Contact enquiries and emails are retained for as long as necessary to address your request, after which they are deleted.",
        ],
    },
    {
        title: "6. Your Rights",
        content: [
            "If you are located in the European Economic Area (EEA), you have the following rights under the General Data Protection Regulation (GDPR):",
        ],
        list: [
            "Right of access — request a copy of any personal data we hold about you.",
            "Right to rectification — request correction of inaccurate data.",
            "Right to erasure — request deletion of your personal data.",
            "Right to restrict processing — request that we limit how we use your data.",
            "Right to data portability — receive your data in a structured, machine-readable format.",
            "Right to object — object to data processing based on legitimate interests.",
        ],
        footer: `To exercise any of these rights, please contact us at ${siteConfig.author.email}.`,
    },
    {
        title: "7. Children's Privacy",
        content: [
            "This website is not directed to individuals under the age of 16. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, please contact us so we can promptly delete it.",
        ],
    },
    {
        title: "8. Changes to This Policy",
        content: [
            "We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated revision date. Continued use of the website after changes constitutes acceptance of the revised policy.",
        ],
    },
    {
        title: "9. Contact",
        content: [
            `If you have any questions about this Privacy Policy, please contact us at ${siteConfig.author.email}.`,
        ],
    },
];

export default function PrivacyPolicyPage() {
    return (
        <div className="pt-24 pb-32">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-14">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
                        Legal
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-100 mb-4 leading-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-slate-500">
                        Last updated: {lastUpdated}
                    </p>
                    <p className="text-lg text-slate-400 leading-relaxed mt-4 max-w-2xl">
                        Your privacy matters. This page explains what data this website collects, how
                        it is used, and your rights regarding that data.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                    {sections.map(({ title, content, list, footer }) => (
                        <section key={title}>
                            <h2 className="text-xl font-bold text-slate-100 mb-3">{title}</h2>
                            <div className="space-y-3 text-slate-400 text-[15px] leading-relaxed">
                                {content.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                                {list && (
                                    <ul className="space-y-2 pl-5">
                                        {list.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2.5">
                                                <span className="text-indigo-400 mt-0.5 font-bold flex-shrink-0">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {footer && <p className="text-slate-500 text-sm mt-2">{footer}</p>}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Bottom links */}
                <div className="mt-16 pt-8 border-t border-slate-800/40 flex flex-wrap gap-6 text-sm text-slate-500">
                    <a href="/terms-of-service" className="hover:text-slate-300 transition-colors">
                        Terms of Service →
                    </a>
                    <a href="/support" className="hover:text-slate-300 transition-colors">
                        Support →
                    </a>
                    <a href="/contact" className="hover:text-slate-300 transition-colors">
                        Contact →
                    </a>
                </div>
            </div>
        </div>
    );
}
