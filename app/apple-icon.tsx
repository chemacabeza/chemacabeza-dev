import { ImageResponse } from "next/og";

// Apple touch icon (180×180) generated at build time — no static asset needed.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#020817",
                    color: "#818cf8",
                    fontSize: 96,
                    fontWeight: 800,
                    borderRadius: 40,
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                C
            </div>
        ),
        { ...size }
    );
}
