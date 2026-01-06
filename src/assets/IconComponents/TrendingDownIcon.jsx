export default function TrendingDownIcon({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M20 11V16H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 16L15 11c-.883-.883-1.324-1.324-1.865-1.373a1.9 1.9 0 0 0-1.73 0C10.882 9.676 10.441 10.117 9.559 11c-.883.883-1.324 1.324-1.865 1.373a1.9 1.9 0 0 1-1.73 0C4.882 12.324 4.441 11.883 3.559 11L2 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}