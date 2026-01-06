export default function TrashCircleIcon({ size = 20, color = "#ffffff", background = "rgba(15, 23, 42, 0.6)", ...props }) {
  const radius = size + 10;
  return (
    <svg
      width={radius}
      height={radius}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="20" cy="20" r="20" fill={background} />
      <path
        d="M14 14H26"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17 14L17.6214 12.8649C18.0768 12.0307 18.3045 11.6136 18.6795 11.3327C19.0545 11.0519 19.5268 11 20.4713 11H19.5287C20.4732 11 20.9455 11.0519 21.3205 11.3327C21.6955 11.6136 21.9232 12.0307 22.3786 12.8649L23 14"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16.5 17.5V25.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M23.5 17.5V25.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.75 14H25.25L24.5804 26.1027C24.4779 27.9705 24.4267 28.9044 24.0372 29.5967C23.8622 29.9046 23.6272 30.1736 23.3466 30.3843C22.7256 30.8562 21.7881 30.8562 19.913 30.8562C18.0379 30.8562 17.1004 30.8562 16.4794 30.3843C16.1988 30.1736 15.9638 29.9046 15.7888 29.5967C15.3992 28.9044 15.3481 27.9705 15.2456 26.1027L14.75 14Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
