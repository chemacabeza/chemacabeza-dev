#!/usr/bin/env node
/**
 * test-resend.mjs
 *
 * End-to-end smoke test for the Resend email integration.
 *
 * Reads RESEND_API_KEY from .env.local, sends a real tracked test email
 * to chema@chemacabeza.dev, and prints the result with instructions to
 * verify open/click tracking in the Resend dashboard.
 *
 * Usage:
 *   node scripts/test-resend.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ─── Load .env.local ──────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const envPath    = join(__dirname, "..", ".env.local");

let apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    try {
        const raw = readFileSync(envPath, "utf8");
        for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (trimmed.startsWith("RESEND_API_KEY=")) {
                apiKey = trimmed.slice("RESEND_API_KEY=".length).trim();
                break;
            }
        }
    } catch {
        // .env.local not found — will fail below with a clear message
    }
}

if (!apiKey || apiKey === "your_api_key_here") {
    console.error("\n❌  RESEND_API_KEY is not set.");
    console.error("    Add it to .env.local:\n");
    console.error("    RESEND_API_KEY=re_...\n");
    process.exit(1);
}

// ─── Test email payload ───────────────────────────────────────────────────────

const now      = new Date().toISOString();
const testId   = `test-${Date.now()}`;
const subject  = `[TEST] Resend tracking smoke test — ${now}`;

// Minimal but valid HTML email with:
//   • a tracking pixel  (Resend inserts this automatically)
//   • a clickable link  (wrapped by track.chemacabeza.dev when tracking is active)
const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family:sans-serif;background:#0a0f1e;color:#e2e8f0;padding:40px 20px;">
  <div style="max-width:560px;margin:0 auto;background:#0d1117;border:1px solid #1e293b;border-radius:12px;padding:32px;">

    <p style="color:#818cf8;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin:0 0 12px;">
      chemacabeza.dev — tracking test
    </p>

    <h1 style="color:#f1f5f9;font-size:20px;margin:0 0 20px;">
      ✅ Resend integration is working
    </h1>

    <p style="color:#94a3b8;line-height:1.7;margin:0 0 8px;">
      This is an automated smoke test sent at <strong style="color:#e2e8f0;">${now}</strong>.
    </p>
    <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px;">
      Test ID: <code style="color:#818cf8;">${testId}</code>
    </p>

    <p style="color:#94a3b8;line-height:1.7;margin:0 0 12px;">
      Click the button below to verify <strong>click tracking</strong> is working.
      After clicking, go to
      <a href="https://resend.com/emails" style="color:#6366f1;">resend.com/emails</a>
      and look for this email — you should see the click recorded.
    </p>

    <a href="https://chemacabeza.dev"
       style="display:inline-block;background:#4f46e5;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
      Click to test tracking →
    </a>

    <p style="color:#475569;font-size:12px;margin-top:28px;padding-top:20px;border-top:1px solid #1e293b;">
      This is a test email. Open tracking is verified automatically when this email is opened.
    </p>
  </div>
</body>
</html>
`;

// ─── Send via Resend REST API ─────────────────────────────────────────────────

console.log("\n🔵  Sending test email to chema@chemacabeza.dev …");
console.log(`    Subject : ${subject}`);
console.log(`    Test ID : ${testId}\n`);

let response;
try {
    response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type":  "application/json",
        },
        body: JSON.stringify({
            from:    "Contact Form <contact@chemacabeza.dev>",
            to:      ["chema@chemacabeza.dev"],
            subject,
            html,
            tags: [
                { name: "source",  value: "smoke-test"       },
                { name: "test_id", value: testId             },
                { name: "site",    value: "chemacabeza-dev"  },
            ],
        }),
    });
} catch (err) {
    console.error("❌  Network error:", err.message);
    process.exit(1);
}

const body = await response.json();

// ─── Report ───────────────────────────────────────────────────────────────────

if (!response.ok) {
    console.error("❌  Resend API returned an error:");
    console.error("    Status :", response.status);
    console.error("    Body   :", JSON.stringify(body, null, 2));
    console.error("\n    Common causes:");
    console.error("    • API key is invalid or revoked → regenerate at resend.com/api-keys");
    console.error("    • Domain not verified → check resend.com/domains");
    console.error("    • 'from' address domain not matching verified domain\n");
    process.exit(1);
}

const emailId = body.id;

console.log("✅  Email sent successfully!\n");
console.log(`    Email ID : ${emailId}`);
console.log(`    Status   : ${response.status} ${response.statusText}\n`);

console.log("─────────────────────────────────────────────────────────────────");
console.log("  Next steps to verify tracking:\n");
console.log("  1. Open your inbox at chema@chemacabeza.dev");
console.log(`     Look for: "${subject.slice(0, 60)}…"`);
console.log("     → Opening the email verifies OPEN tracking\n");
console.log("  2. Click the 'Click to test tracking →' button in the email");
console.log("     → This verifies CLICK tracking via track.chemacabeza.dev\n");
console.log("  3. Check the Resend dashboard:");
console.log(`     https://resend.com/emails/${emailId}`);
console.log("     You should see: delivered → opened → clicked\n");
console.log("─────────────────────────────────────────────────────────────────\n");
