function ImageIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}

export default ImageIcon;