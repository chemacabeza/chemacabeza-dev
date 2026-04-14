"use client";
import { useState } from "react";
import { Send } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
        const res = await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setStatus("success");
            setEmail("");
        } else {
            setStatus("error");
        }
    } catch (err) {
        setStatus("error");
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-8 my-8 max-w-2xl mx-auto shadow-sm">
      <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">Subscribe to my newsletter</h3>
      <p className="text-slate-400 mb-6 text-sm sm:text-base leading-relaxed">
        Get deep-dive engineering guides, system design teardowns, and AI architectures delivered straight to your inbox. No spam, ever.
      </p>
      
      <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
          }}
          placeholder="your.email@example.com"
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/50 transition-all placeholder:text-slate-600"
        />
        <button 
          disabled={status === "loading" || status === "success"}
          className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
        >
          {status === "loading" ? "Sending..." : status === "success" ? "Subscribed!" : "Subscribe"}
          {status === "idle" && <Send size={18} />}
        </button>
      </form>
      
      {status === "error" && (
          <p className="text-red-400 text-sm mt-3 animate-fade-in">Oops, something went wrong. Please try again.</p>
      )}
      {status === "success" && (
          <p className="text-emerald-400 text-sm mt-3 animate-fade-in">Thanks for subscribing! Check your inbox for confirmation.</p>
      )}
    </div>
  );
}
