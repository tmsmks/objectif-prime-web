import Link from "next/link";

export function Logo({ size = "md", href }: { size?: "sm" | "md" | "lg"; href?: string }) {
  const dims = { sm: 28, md: 34, lg: 44 }[size];
  const text = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size];

  const content = (
    <span className={`inline-flex items-center gap-1.5 font-bold ${text}`}>
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Barbell bar */}
        <rect x="8" y="29" width="48" height="6" rx="3" fill="#a1a1aa" />
        {/* Left weight */}
        <rect x="4" y="20" width="10" height="24" rx="3" fill="#16a34a" />
        {/* Right weight */}
        <rect x="50" y="20" width="10" height="24" rx="3" fill="#16a34a" />
        {/* Trophy cup */}
        <path
          d="M24 12h16v14c0 5.5-3.6 10-8 10s-8-4.5-8-10V12z"
          fill="#facc15"
          stroke="#eab308"
          strokeWidth="1.5"
        />
        {/* Trophy handles */}
        <path
          d="M24 16c-3 0-6 2-6 6s3 6 6 6"
          stroke="#eab308"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M40 16c3 0 6 2 6 6s-3 6-6 6"
          stroke="#eab308"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Trophy base */}
        <rect x="28" y="36" width="8" height="4" rx="1" fill="#eab308" />
        <rect x="25" y="40" width="14" height="3" rx="1.5" fill="#eab308" />
        {/* Star on trophy */}
        <path
          d="M32 17l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L32 17z"
          fill="#ffffff"
        />
      </svg>
      <span>
        Objectif <span className="text-primary">Prime</span>
      </span>
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
