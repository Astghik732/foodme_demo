export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="128"
      height="32"
      viewBox="0 0 128 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FoodMe"
    >
      <circle cx="16" cy="16" r="14" fill="#18181b" />
      <path
        d="M10 12c0-2.2 1.8-4 4-4s4 1.8 4 4M10 12h8M10 12v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M20 9v13" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <text
        x="36"
        y="21"
        fontFamily="'Noto Sans', 'Open Sans', sans-serif"
        fontSize="17"
        fontWeight="800"
        fill="#18181b"
      >
        Food<tspan fill="#71717a">Me</tspan>
      </text>
    </svg>
  );
}
