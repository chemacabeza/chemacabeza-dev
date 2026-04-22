import * as React from "react";

interface ContactEmailProps {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
}

export function ContactEmail({
    senderName,
    senderEmail,
    subject,
    message,
}: ContactEmailProps) {
    const formattedMessage = message.replace(/\n/g, "<br/>");

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{subject}</title>
            </head>
            <body
                style={{
                    backgroundColor: "#0a0f1e",
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    margin: "0",
                    padding: "0",
                }}
            >
                <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ backgroundColor: "#0a0f1e", padding: "40px 20px" }}
                >
                    <tbody>
                        <tr>
                            <td align="center">
                                <table
                                    width="600"
                                    cellPadding="0"
                                    cellSpacing="0"
                                    style={{
                                        backgroundColor: "#0d1117",
                                        borderRadius: "12px",
                                        border: "1px solid #1e293b",
                                        overflow: "hidden",
                                        maxWidth: "600px",
                                        width: "100%",
                                    }}
                                >
                                    {/* Header */}
                                    <tbody>
                                        <tr>
                                            <td
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
                                                    padding: "32px 40px",
                                                    borderBottom: "1px solid #1e293b",
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        color: "#818cf8",
                                                        fontSize: "11px",
                                                        fontWeight: "700",
                                                        letterSpacing: "0.15em",
                                                        textTransform: "uppercase",
                                                        margin: "0 0 8px",
                                                    }}
                                                >
                                                    chemacabeza.dev
                                                </p>
                                                <h1
                                                    style={{
                                                        color: "#f1f5f9",
                                                        fontSize: "22px",
                                                        fontWeight: "700",
                                                        margin: "0",
                                                        lineHeight: "1.3",
                                                    }}
                                                >
                                                    New message from your contact form
                                                </h1>
                                            </td>
                                        </tr>

                                        {/* Sender info */}
                                        <tr>
                                            <td style={{ padding: "28px 40px 0" }}>
                                                <table width="100%" cellPadding="0" cellSpacing="0">
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    backgroundColor: "#111827",
                                                                    borderRadius: "8px",
                                                                    border: "1px solid #1e293b",
                                                                    padding: "16px 20px",
                                                                }}
                                                            >
                                                                <table width="100%" cellPadding="0" cellSpacing="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style={{ paddingBottom: "10px" }}>
                                                                                <span
                                                                                    style={{
                                                                                        color: "#64748b",
                                                                                        fontSize: "11px",
                                                                                        fontWeight: "600",
                                                                                        textTransform: "uppercase",
                                                                                        letterSpacing: "0.08em",
                                                                                    }}
                                                                                >
                                                                                    From
                                                                                </span>
                                                                                <p
                                                                                    style={{
                                                                                        color: "#e2e8f0",
                                                                                        fontSize: "15px",
                                                                                        margin: "4px 0 0",
                                                                                        fontWeight: "600",
                                                                                    }}
                                                                                >
                                                                                    {senderName}
                                                                                </p>
                                                                                <a
                                                                                    href={`mailto:${senderEmail}`}
                                                                                    style={{
                                                                                        color: "#818cf8",
                                                                                        fontSize: "13px",
                                                                                        textDecoration: "none",
                                                                                    }}
                                                                                >
                                                                                    {senderEmail}
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td
                                                                                style={{
                                                                                    borderTop: "1px solid #1e293b",
                                                                                    paddingTop: "10px",
                                                                                }}
                                                                            >
                                                                                <span
                                                                                    style={{
                                                                                        color: "#64748b",
                                                                                        fontSize: "11px",
                                                                                        fontWeight: "600",
                                                                                        textTransform: "uppercase",
                                                                                        letterSpacing: "0.08em",
                                                                                    }}
                                                                                >
                                                                                    Subject
                                                                                </span>
                                                                                <p
                                                                                    style={{
                                                                                        color: "#e2e8f0",
                                                                                        fontSize: "14px",
                                                                                        margin: "4px 0 0",
                                                                                    }}
                                                                                >
                                                                                    {subject}
                                                                                </p>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                        {/* Message body */}
                                        <tr>
                                            <td style={{ padding: "24px 40px" }}>
                                                <p
                                                    style={{
                                                        color: "#64748b",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.08em",
                                                        margin: "0 0 12px",
                                                    }}
                                                >
                                                    Message
                                                </p>
                                                <div
                                                    style={{
                                                        color: "#cbd5e1",
                                                        fontSize: "15px",
                                                        lineHeight: "1.7",
                                                        whiteSpace: "pre-wrap",
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: formattedMessage }}
                                                />
                                            </td>
                                        </tr>

                                        {/* Reply CTA */}
                                        <tr>
                                            <td style={{ padding: "0 40px 28px" }}>
                                                <a
                                                    href={`mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject)}`}
                                                    style={{
                                                        display: "inline-block",
                                                        backgroundColor: "#4f46e5",
                                                        color: "#ffffff",
                                                        fontSize: "14px",
                                                        fontWeight: "600",
                                                        padding: "12px 24px",
                                                        borderRadius: "8px",
                                                        textDecoration: "none",
                                                    }}
                                                >
                                                    Reply to {senderName} →
                                                </a>
                                            </td>
                                        </tr>

                                        {/* Footer */}
                                        <tr>
                                            <td
                                                style={{
                                                    borderTop: "1px solid #1e293b",
                                                    padding: "20px 40px",
                                                    backgroundColor: "#080c14",
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        color: "#475569",
                                                        fontSize: "12px",
                                                        margin: "0",
                                                        lineHeight: "1.6",
                                                    }}
                                                >
                                                    This message was sent via the contact form at{" "}
                                                    <a
                                                        href="https://chemacabeza.dev/contact"
                                                        style={{ color: "#6366f1", textDecoration: "none" }}
                                                    >
                                                        chemacabeza.dev/contact
                                                    </a>
                                                    . Reply directly to this email to respond to {senderName}.
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>
    );
}
