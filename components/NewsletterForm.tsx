"use client";

export default function NewsletterForm() {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 sm:p-10 my-12 max-w-2xl mx-auto shadow-2xl relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-fuchsia-600/10 blur-[80px] rounded-full group-hover:bg-fuchsia-600/20 transition-colors duration-700" />
      
      <div className="relative z-10">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mb-3 tracking-tight">
          Join the Newsletter
        </h3>
        <p className="text-slate-400 mb-8 text-base sm:text-lg leading-relaxed max-w-md">
          Get deep-dive engineering guides and system design teardowns delivered straight to your inbox.
        </p>

        {/* Official Substack Embed */}
        <div className="rounded-xl overflow-hidden border border-slate-800/50 bg-white/5 backdrop-blur-sm">
          <iframe
            src="https://chemacabezadev.substack.com/embed"
            width="100%"
            height="320"
            style={{ 
                border: 'none', 
                background: 'transparent',
                borderRadius: '12px'
            }}
            title="Substack Newsletter Subscription"
          />
        </div>
        
        <p className="text-slate-500 text-xs mt-6 text-center italic">
          Powered by Substack. No spam, ever. Unsubscribe with one click.
        </p>
      </div>
    </div>
  );
}
