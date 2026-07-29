import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/nav";
import { getInitials } from "@/lib/logo";

export const runtime = "edge";

export const size = {
  width: 48,
  height: 48
};

export const contentType = "image/png";

export default function Icon() {
  const initials = getInitials(BRAND.name);

  return new ImageResponse(
    (
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#3B1F2B",
          border: "2px solid #B08D57",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FBF6F1",
          fontSize: "20px",
          fontWeight: 600,
          fontFamily: "Georgia, serif"
        }}
      >
        {initials}
      </div>
    ),
    { ...size }
  );
}
