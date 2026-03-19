import { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
    title: "About",
    description:
        "Engineering Manager with 15+ years building high-performance backend systems, distributed architectures, and the teams that ship them.",
    path: "/about",
});

const experience = [
    {
        period: "Sept 2020 — Present",
        role: "Engineering Manager — Partner Account Infrastructure",
        company: "Klarna",
        location: "Berlin, Germany 🇩🇪",
        description:
            "Lead a team of 8 (4 mid-level engineers, 2 senior engineers, 1 PM). Oversee security and quality of 7 critical services handling API integrations with 40+ distribution partners (Adyen, Mollie, Stripe, etc.). Spearheaded a major Stripe integration onboarding 1,700+ merchants weekly. Designed and implemented a global merchant tracking service handling 1.4M+ requests per week. Proposed and co-built a custom framework to decouple our main system from services and queues — enabling automatic retriggering, call prioritisation, and chaining, significantly reducing maintenance overhead. Conducted 40+ Java technical interviews and coached a Senior Engineer to Lead Engineer.",
    },
    {
        period: "Sept 2018 — Sept 2020",
        role: "Senior Software Engineer — Merchant Account Infrastructure",
        company: "Klarna",
        location: "Berlin, Germany 🇩🇪",
        description:
            "Automated partner pricing setup, reducing manual work from 4 days to 15 minutes. Led migration from Salesforce to a custom in-house system across 3 services. Developed a KPI monitoring dashboard in Grafana to improve system performance tracking. Coached and mentored junior engineers, resulting in multiple promotions to Senior Engineer.",
    },
    {
        period: "Dec 2017 — Aug 2018",
        role: "Senior Software Engineer — Data Platform Team",
        company: "NCR",
        location: "Edinburgh, Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿",
        description:
            "Maintained and enhanced legacy banking transaction analysis pipelines using Java, Dropwizard, Cassandra, HBase, and Hadoop.",
    },
    {
        period: "May 2015 — Nov 2017",
        role: "Senior Software Engineer — Aftersales Pricing Orchestration",
        company: "Amadeus IT Group",
        location: "Sophia Antipolis, France 🇫🇷",
        description:
            "Refactored Amadeus Ticket Changer, simplifying debugging and enhancement via XML-based configurations. Designed and implemented a proprietary discount coupon algorithm for Japan Airlines, reducing computational complexity from O(n!) to O(n³) — generating results in under 100ms (vs. minutes), avoiding the need for a new dedicated backend.",
    },
    {
        period: "Jan 2014 — Jun 2015",
        role: "Software Engineer — Issuance, Documents & Reporting",
        company: "Amadeus IT Group",
        location: "Sophia Antipolis, France 🇫🇷",
        description:
            "Designed, architected and built the module responsible for gathering and managing reporting features across Amadeus products (Selling Platform, Sell Connect, Amadeus e-Travel Management), including integration with American Express and Airplus International.",
    },
    {
        period: "Jun 2011 — Dec 2013",
        role: "Software Engineer — Leisure Shopping",
        company: "Amadeus IT Group",
        location: "Sophia Antipolis, France 🇫🇷",
        description:
            "Integrated Amadeus with American Express BTA, ensuring PCI-DSS compliance. Responsible as functional analyst and front-end developer for new rail market features for Trenitalia, SNCF, Swedish Rail, and DBahn in Selling Platform and Amadeus e-Travel Management.",
    },
    {
        period: "Nov 2009 — May 2011",
        role: "Software Engineer",
        company: "Cystelcom",
        location: "Madrid, Spain 🇪🇸",
        description:
            "Led development of Veedia Seminar Portal for Polycom Inc. to facilitate remote video conferencing. Built an ICEfaces 2 web app for Helvetia Seguros to monitor trader activity in real time. Design and development manager for a Flash-based web application creating an Interactive Voice Response system via flowcharts for Vodafone Spain.",
    },
    {
        period: "Jun 2007 — May 2009",
        role: "UPM Scholarship — Programmer",
        company: "Teldat SA",
        location: "Madrid, Spain 🇪🇸",
        description:
            "Selected on the basis of outstanding academic performance by the Telematics Laboratory of Universidad Politécnica de Madrid. Led modification of a Debian-based OS to automate marketing study installations. Designed, developed and maintained a communication system between two modules of marketing studies software using facial recognition via webcams.",
    },
];

const principles = [
    {
        number: "01",
        title: "Simplicity is a feature",
        desc: "Complex systems fail in complex ways. I ruthlessly cut scope and complexity. The best code is often the code you don't write.",
    },
    {
        number: "02",
        title: "Observability-first",
        desc: "You cannot debug what you cannot see. Every system I build ships with structured logging, distributed traces, and meaningful metrics from day one.",
    },
    {
        number: "03",
        title: "Strong opinions, loosely held",
        desc: "I form clear technical positions and defend them with data — but I change my mind when presented with better evidence. Intellectual integrity over ego.",
    },
    {
        number: "04",
        title: "Autonomy through context",
        desc: "The best teams don't need micromanagement. I invest in giving engineers deep context on business goals so they can make great decisions independently.",
    },
    {
        number: "05",
        title: "Ship, learn, iterate",
        desc: "Perfect is the enemy of shipped. I lean into iterative delivery, measure outcomes, and compound learnings. Momentum beats perfection.",
    },
    {
        number: "06",
        title: "Write more than you think",
        desc: "Writing clarifies thinking. RFCs, post-mortems, ADRs — documentation is not overhead. It is how knowledge outlives the people who had it.",
    },
];

export default function AboutPage() {
    return (
        <div className="pt-24 pb-32">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
                        About
                    </span>
                    <h1 className="text-5xl sm:text-6xl font-black text-slate-100 mb-6 leading-tight">
                        Building systems
                        <br />
                        <span className="gradient-text">and the teams</span> behind them.
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                        I&apos;m José María Cabeza Rodríguez — an Engineering Manager based in Berlin with
                        15+ years of experience delivering backend systems, distributed architectures, and
                        high-performing engineering teams across France, Scotland, and Germany.
                    </p>
                </div>

                {/* Professional story */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold text-slate-100 mb-6">My story</h2>
                    <div className="space-y-5 text-slate-400 leading-relaxed text-[17px]">
                        <p>
                            My journey started in Madrid, where I studied Computer Science at Universidad Politécnica
                            de Madrid and was selected — on academic merit — to do R&D at Teldat SA. That early taste
                            of real-world engineering, writing communication systems and patching Debian kernels, set
                            the tone for everything that followed.
                        </p>
                        <p>
                            From Madrid I moved to the south of France to join Amadeus IT, where I spent six years
                            across three teams. I designed reporting infrastructure used by American Express and
                            Airplus, built PCI-DSS-compliant integrations, and delivered a proprietary algorithm for
                            Japan Airlines that reduced ticket coupon computation from O(n!) to O(n³) — cutting
                            response times from minutes to under 100ms.
                        </p>
                        <p>
                            After a stint in Edinburgh working on banking transaction pipelines, I joined the
                            Merchant Partner Account Infrastructure team in Berlin. I grew from Senior Software
                            Engineer to Engineering Manager, and today I lead a team of 8 building the critical
                            systems that power payment integrations for 1,700+ merchants weekly — handling 1.4M+
                            requests per week through services I designed and still evolve.
                        </p>
                        <p>
                            The shift into management wasn&apos;t a pivot — it was an extension. The highest-leverage
                            thing I can do is make the engineers around me more effective. I never stopped being an
                            engineer; I just became a different kind.
                        </p>
                    </div>
                </section>

                {/* Experience timeline */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold text-slate-100 mb-8">Experience</h2>
                    <div className="space-y-0">
                        {experience.map((item, idx) => (
                            <div key={idx} className="relative flex gap-6 pb-10 last:pb-0">
                                {/* Timeline line */}
                                {idx < experience.length - 1 && (
                                    <div className="absolute left-[5.5px] top-5 bottom-0 w-px bg-gradient-to-b from-indigo-500/30 to-transparent" />
                                )}
                                {/* Dot */}
                                <div className="mt-1.5 w-3 h-3 rounded-full bg-indigo-500/20 border-2 border-indigo-500/60 flex-shrink-0" />
                                <div>
                                    <span className="text-xs font-semibold text-indigo-400 tracking-wide">
                                        {item.period}
                                    </span>
                                    <h3 className="font-bold text-slate-100 text-lg mt-0.5">{item.role}</h3>
                                    <p className="text-sm mb-2 flex items-center gap-1.5">
                                        <span className="text-slate-300 font-medium">{item.company}</span>
                                        <span className="text-slate-600">·</span>
                                        <span className="text-slate-500">{item.location}</span>
                                    </p>
                                    <p className="text-slate-400 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Education */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold text-slate-100 mb-6">Education</h2>
                    <div className="space-y-4">
                        {[
                            {
                                period: "Sep 2003 — Sep 2009",
                                degree: "M.Sc. in Computer Science",
                                school: "Universidad Politécnica de Madrid, Spain",
                                note: "Final Project: Web app to manage research group information — Honors",
                            },
                            {
                                period: "Jan 2008 — Sep 2009",
                                degree: "Specialization in Web Computer Software",
                                school: "Universidad Politécnica de Madrid, Spain",
                                note: "",
                            },
                        ].map(({ period, degree, school, note }) => (
                            <div
                                key={degree}
                                className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6"
                            >
                                <span className="text-xs font-semibold text-indigo-400">{period}</span>
                                <h3 className="font-bold text-slate-100 mt-0.5">{degree}</h3>
                                <p className="text-sm text-slate-500">{school}</p>
                                {note && <p className="text-sm text-slate-400 mt-1">{note}</p>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Certifications & Courses */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold text-slate-100 mb-6">Certifications &amp; Courses</h2>

                    {/* Oracle certifications */}
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">Certifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        {[
                            { year: "2013", title: "Oracle Certified Java Programmer", issuer: "Oracle" },
                            { year: "2011", title: "Oracle Certified Java Associate", issuer: "Oracle" },
                        ].map(({ year, title, issuer }) => (
                            <div
                                key={title}
                                className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 flex items-start gap-4"
                            >
                                <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0 text-sm font-bold text-indigo-400">
                                    {year.slice(2)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-100 leading-snug">{title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{issuer} · {year}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Online courses */}
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">Online Courses</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { year: "2025", title: "Flux Step by Step — AI Influencers & Fanvue Models FAST", platform: "Udemy", instructor: "Dominik Felber" },
                            { year: "2025", title: "Realistic AI Images with Stable Diffusion & Fooocus", platform: "Udemy", instructor: "Dominik Felber" },
                            { year: "2025", title: "OKR Goal Setting 101", platform: "Udemy", instructor: "Axel Ritterhaus" },
                            { year: "2025", title: "Spring Boot 3, Spring 6 & Hibernate for Beginners", platform: "Udemy", instructor: "Chad Darby" },
                            { year: "2020", title: "React — The Complete Guide", platform: "Udemy", instructor: "Academind" },
                            { year: "2019", title: "CSS — The Complete Guide", platform: "Udemy", instructor: "Academind" },
                            { year: "2017", title: "Machine Learning Specialization", platform: "Coursera", instructor: "University of Washington" },
                            { year: "2017", title: "Machine Learning: Clustering & Retrieval", platform: "Coursera", instructor: "University of Washington" },
                            { year: "2017", title: "Machine Learning: Classification", platform: "Coursera", instructor: "University of Washington" },
                            { year: "2017", title: "Machine Learning: Regression", platform: "Coursera", instructor: "University of Washington" },
                            { year: "2017", title: "Machine Learning Foundations", platform: "Coursera", instructor: "University of Washington" },
                            { year: "2016", title: "Machine Learning", platform: "Coursera", instructor: "Stanford University" },
                            { year: "2015", title: "Data Analysis and Statistical Inference", platform: "Coursera", instructor: "Duke University" },
                        ].map(({ year, title, platform, instructor }) => (
                            <div
                                key={title}
                                className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 flex items-start gap-3"
                            >
                                <span className="text-xs font-mono font-bold text-slate-600 mt-0.5 w-8 flex-shrink-0">{year}</span>
                                <div>
                                    <p className="text-sm font-medium text-slate-200 leading-snug">{title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{platform} · {instructor}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Engineering principles */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-100 mb-3">Engineering principles</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        These aren&apos;t aspirational. They&apos;re the lens through which I evaluate every technical
                        decision and engineering interaction.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {principles.map(({ number, title, desc }) => (
                            <div
                                key={number}
                                className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 hover:border-indigo-500/30 transition-all duration-300"
                            >
                                <span className="text-xs font-bold text-indigo-500/60 font-mono mb-3 block">
                                    {number}
                                </span>
                                <h3 className="font-bold text-slate-100 mb-2">{title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
