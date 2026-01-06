export default function LoginArrowIcon({ stroke = "#4a90e2", size = 18, ...props }) {
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
        d="M3.00006 7.63576C4.6208 4.29965 8.04185 2 12 2C17.5229 2 22 6.47715 22 12C22 17.5228 17.5229 22 12 22C8.04185 22 4.6208 19.7004 3.00006 16.3642"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 8C11 8 15 10.946 15 12C15 13.0541 11 16 11 16M14.5 12H2"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
