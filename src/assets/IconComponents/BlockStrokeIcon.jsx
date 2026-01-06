export default function BlockStrokeIcon({ stroke = "#d0021b", size = 18, ...props }) {
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
        d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
