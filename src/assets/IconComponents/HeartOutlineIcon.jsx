export default function HeartOutlineIcon({ stroke = "#f15151", size = 18, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M19.5 12.572 12 20 4.5 12.572a4.5 4.5 0 0 1 6.364-6.364L12 7.343l1.136-1.135a4.5 4.5 0 1 1 6.364 6.364Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
