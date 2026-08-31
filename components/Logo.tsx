export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="12" className="fill-brand-600 dark:fill-brand-500" />
      <path
        d="M24 10L36 15.5V22C36 29.5 31 35.8 24 38C17 35.8 12 29.5 12 22V15.5L24 10Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M18.5 24.5L22.2 28.2L29.8 20"
        stroke="#2f4bc2"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
