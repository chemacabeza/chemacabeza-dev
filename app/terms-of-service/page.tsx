import { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
    title: "Terms of Service",
    description:
        "Terms of Service for chemacabeza.dev — conditions governing your use of this website and its services.",
    path: "/terms-of-service",
});

const lastUpdated = "May 5, 2025";

const sections = [
    {
        title: "1. Acceptance of Terms",
        content: [
            "By accessing and using this website (chemacabeza.dev), you accept and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use this website.",
        ],
    },
    {
        title: "2. Description of Services",
        content: [
            "This website serves as a personal portfolio and blog by José María Cabeza Rodríguez. It may also provide access to digital products, tools, and paid consulting services. The availability and scope of services may change at any time without prior notice.",
        ],
    },
    {
        title: "3. Intellectual Property",
        content: [
            "Unless otherwise stated, all content on this website — including text, graphics, images, code, and design — is the intellectual property of José María Cabeza Rodríguez and is protected by applicable copyright and intellectual property laws.",
        ],
        list: [
            "Blog content may be shared with proper attribution and a link back to the original post.",
            "Code samples published on this website or linked GitHub repositories are subject to their respective open-source licences.",
            "You may not reproduce, distribute, or create derivative works from proprietary content without prior written permission.",
        ],
    },
    {
        title: "4. User Conduct",
        content: [
            "When using this website or its services, you agree not to:",
        ],
        list: [
            "Use the website for any unlawful purpose or in violation of any applicable laws.",
            "Attempt to gain unauthorised access to any part of the website, its servers, or connected systems.",
            "Interfere with or disrupt the website's operation, including via automated scripts, bots, or denial-of-service attacks.",
            "Impersonate any person or entity, or misrepresent your affiliation with any party.",
            "Harvest or collect personal data of other users without their consent.",
        ],
    },
    {
        title: "5. Digital Products and Payments",
        content: [
            "If you purchase digital products (such as LoRA models) or book paid consulting sessions through this website:",
        ],
        list: [
            "All prices are displayed in the applicable currency at the time of purchase.",
            "Payments are processed securely via Stripe. We do not store your payment card information.",
            "Digital products are delivered electronically upon successful payment. Due to the nature of digital goods, refunds are handled on a case-by-case basis.",
            "Consulting sessions are subject to the scheduling and cancellation policies outlined on the booking platform (Calendly).",
        ],
    },
    {
        title: "6. Disclaimer of Warranties",
        content: [
            "This website and its content are provided on an \"as is\" and \"as available\" basis without any warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.",
            "We do not guarantee that the website will be error-free, secure, or available at all times. Content is provided for informational purposes and should not be construed as professional advice.",
        ],
    },
    {
        title: "7. Limitation of Liability",
        content: [
            "To the fullest extent permitted by law, José María Cabeza Rodríguez shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, this website or its services.",
            "This includes, without limitation, damages for loss of profits, data, goodwill, or other intangible losses — even if we have been advised of the possibility of such damages.",
        ],
    },
    {
        title: "8. Third-Party Links",
        content: [
            "This website may contain links to third-party websites and services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites.",
            "We strongly advise you to read the terms and privacy policies of any third-party services you visit.",
        ],
    },
    {
        title: "9. Governing Law",
        content: [
            "These Terms of Service are governed by and construed in accordance with the laws of the Federal Republic of Germany. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Berlin, Germany.",
        ],
    },
    {
        title: "10. Changes to These Terms",
        content: [
            "We reserve the right to modify or replace these Terms of Service at any time. Changes will be reflected on this page with an updated revision date. Your continued use of the website after any changes constitutes acceptance of the new terms.",
        ],
    },
    {
        title: "11. Contact",
        content: [
            `If you have any questions about these Terms of Service, please contact us at ${siteConfig.author.email}.`,
        ],
    },
];

export default function TermsOfServicePage() {
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
                        Terms of Service
                    </h1>
                    <p className="text-sm text-slate-500">
                        Last updated: {lastUpdated}
                    </p>
                    <p className="text-lg text-slate-400 leading-relaxed mt-4 max-w-2xl">
                        Please read these terms carefully before using this website. By continuing to use
                        chemacabeza.dev, you agree to be bound by these terms.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                    {sections.map(({ title, content, list }) => (
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
                            </div>
                        </section>
                    ))}
                </div>

                {/* Bottom links */}
                <div className="mt-16 pt-8 border-t border-slate-800/40 flex flex-wrap gap-6 text-sm text-slate-500">
                    <a href="/privacy-policy" className="hover:text-slate-300 transition-colors">
                        Privacy Policy →
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
