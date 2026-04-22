"use client";

import { useState, useRef } from "react";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
    const [state, setState] = useState<FormState>("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (state === "submitting") return;

        setState("submitting");
        setErrorMessage("");

        const form = e.currentTarget;
        const data = {
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
            message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
            honeypot: (form.elements.namedItem("website") as HTMLInputElement).value,
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok) {
                setErrorMessage(json.error ?? "Something went wrong. Please try again.");
                setState("error");
                return;
            }

            setState("success");
            formRef.current?.reset();
        } catch {
            setErrorMessage("Network error. Please check your connection and try again.");
            setState("error");
        }
    }

    if (state === "success") {
        return (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                </div>
                <h3 className="font-bold text-slate-100 text-lg mb-2">Message sent!</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    Thanks for reaching out. I&apos;ll get back to you as soon as I can.
                </p>
                <button
                    onClick={() => setState("idle")}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Honeypot — hidden from real users, bots fill it */}
            <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                style={{ display: "none" }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                    <label
                        htmlFor="contact-name"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
                    >
                        Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Jane Smith"
                        disabled={state === "submitting"}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                </div>

                {/* Email */}
                <div>
                    <label
                        htmlFor="contact-email"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
                    >
                        Email <span className="text-indigo-400">*</span>
                    </label>
                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="jane@example.com"
                        disabled={state === "submitting"}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                </div>
            </div>

            {/* Subject */}
            <div>
                <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
                >
                    Subject
                </label>
                <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    autoComplete="off"
                    placeholder="Engineering role, collaboration, just saying hi…"
                    disabled={state === "submitting"}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
            </div>

            {/* Message */}
            <div>
                <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
                >
                    Message <span className="text-indigo-400">*</span>
                </label>
                <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    placeholder="What's on your mind? The more context the better."
                    disabled={state === "submitting"}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-y min-h-[120px]"
                />
            </div>

            {/* Error message */}
            {state === "error" && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{errorMessage}</p>
                </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between gap-4 pt-1">
                <p className="text-xs text-slate-600">
                    <span className="text-indigo-400">*</span> Required fields
                </p>
                <button
                    type="submit"
                    disabled={state === "submitting"}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors duration-200"
                >
                    {state === "submitting" ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending…
                        </>
                    ) : (
                        <>
                            Send message
                            <Send className="w-3.5 h-3.5" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
