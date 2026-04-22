import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ContactEmail } from "@/emails/ContactEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

// Basic rate limiting: max 3 requests per IP per 10 minutes (in-memory, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return false;
    }

    if (entry.count >= RATE_LIMIT) return true;

    entry.count++;
    return false;
}

export async function POST(request: NextRequest) {
    // Get client IP for rate limiting
    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";

    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please wait a few minutes before trying again." },
            { status: 429 }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { name, email, subject, message, honeypot } = body as Record<string, string>;

    // Honeypot: bots fill hidden fields, humans don't
    if (honeypot) {
        return NextResponse.json({ success: true }); // Silent discard
    }

    // Validation
    if (!name?.trim() || name.trim().length < 2) {
        return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!message?.trim() || message.trim().length < 10) {
        return NextResponse.json(
            { error: "Message must be at least 10 characters." },
            { status: 400 }
        );
    }
    if (message.trim().length > 5000) {
        return NextResponse.json({ error: "Message is too long (max 5000 characters)." }, { status: 400 });
    }

    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedEmail = email.trim().slice(0, 254);
    const sanitizedSubject = (subject?.trim() || "Contact form message").slice(0, 200);
    const sanitizedMessage = message.trim().slice(0, 5000);

    try {
        const { data, error } = await resend.emails.send({
            from: "Contact Form <contact@chemacabeza.dev>",
            to: ["chema@chemacabeza.dev"],
            replyTo: sanitizedEmail,
            subject: `[chemacabeza.dev] ${sanitizedSubject}`,
            react: ContactEmail({
                senderName: sanitizedName,
                senderEmail: sanitizedEmail,
                subject: sanitizedSubject,
                message: sanitizedMessage,
            }),
            // Resend tracking: opens and clicks are tracked in the Resend dashboard
            tags: [
                { name: "source", value: "contact-form" },
                { name: "site", value: "chemacabeza-dev" },
            ],
        });

        if (error) {
            console.error("[contact] Resend error:", error);
            return NextResponse.json(
                { error: "Failed to send message. Please try again or email me directly." },
                { status: 500 }
            );
        }

        console.log("[contact] Email sent successfully, id:", data?.id);
        return NextResponse.json({ success: true, id: data?.id });
    } catch (err) {
        console.error("[contact] Unexpected error:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
