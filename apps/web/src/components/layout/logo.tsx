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
      {/* Uber Eats–style wordmark: black + green accent */}
      <text
        x="0"
        y="23"
        fontFamily="'Plus Jakarta Sans', 'Uber Move', system-ui, sans-serif"
        fontSize="20"
        fontWeight="800"
        fill="#000"
        letterSpacing="-0.5"
      >
        Food
      </text>
      <text
        x="52"
        y="23"
        fontFamily="'Plus Jakarta Sans', 'Uber Move', system-ui, sans-serif"
        fontSize="20"
        fontWeight="800"
        fill="#06C167"
        letterSpacing="-0.5"
      >
        Me
      </text>
    </svg>
  );
}
