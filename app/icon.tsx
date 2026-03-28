import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Morgan's MP-5 mark paths in 200×260 viewBox coordinates
const MARK =
  "M 100 12 C 138 12, 160 40, 158 72 C 156 100, 136 120, 108 130 " +
  "C 100 132, 100 132, 100 132 C 100 132, 84 126, 72 114 " +
  "C 56 98, 48 76, 52 56 C 56 38, 70 24, 90 20 C 100 18, 112 22, 120 30 " +
  "C 134 44, 138 66, 128 82 C 118 98, 100 104, 86 98 " +
  "C 74 92, 70 78, 76 68 C 82 58, 94 54, 104 60";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#111109",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={17}
          height={22}
          viewBox="0 0 200 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={MARK}
            stroke="#C8962E"
            strokeWidth={18}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 100 132 L 100 215"
            stroke="#C8962E"
            strokeWidth={17}
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
