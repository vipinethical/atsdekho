import { ImageResponse } from "next/og";

export const ogAlt = "ATSDekho — See what Naukri actually reads";
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function ogImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#f3eee4",
          color: "#1c1917",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#9a3412",
          }}
        >
          Naukri · IIMJobs · LinkedIn
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 600 }}>ATSDekho</div>
          <div style={{ display: "flex", fontSize: 58, lineHeight: 1.12, maxWidth: 900 }}>
            See what the parser actually reads.
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#57534e", maxWidth: 820 }}>
            Indian ATS resume fixer. Show the garbled extract, then download a .docx Naukri can
            parse. ₹199.
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
