export default function EditOutlineIcon({ stroke = "#4a90e2", size = 18, ...props }) {
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
        d="M5 21h14M5 16.75l9.586-9.586a2 2 0 0 1 2.828 0l0.422 0.422a2 2 0 0 1 0 2.828L8.25 20H5z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
