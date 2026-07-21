import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/metadata";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "64px 72px",
                    background: "linear-gradient(135deg, #020817 0%, #0f172a 50%, #1e1b4b 100%)",
                    color: "#f1f5f9",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "32px",
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#818cf8",
                    }}
                >
                    chemacabeza.dev
                </div>
                <div
                    style={{
                        fontSize: 52,
                        fontWeight: 800,
                        lineHeight: 1.15,
                        letterSpacing: "-0.02em",
                        maxWidth: "900px",
                    }}
                >
                    Engineering leadership, system design, and backend architecture
                </div>
                <div
                    style={{
                        marginTop: "28px",
                        fontSize: 26,
                        lineHeight: 1.4,
                        color: "#94a3b8",
                        maxWidth: "820px",
                    }}
                >
                    {siteConfig.name}
                </div>
            </div>
        ),
        { ...size },
    );
}
