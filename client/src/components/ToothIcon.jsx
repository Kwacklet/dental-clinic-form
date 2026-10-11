// Simple inline tooth icon, so no icon library is needed.
function ToothIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5.6C10.6 4.3 9 3.5 7.2 3.5 4.7 3.5 3 5.5 3 8.2c0 2.1.8 3.5 1.5 5 .7 1.5.9 3 1.2 4.8.3 2 .8 3.5 2 3.5 1.4 0 1.7-1.7 2-3.4.3-1.6.8-3 2.3-3s2 1.4 2.3 3c.3 1.7.6 3.4 2 3.4 1.2 0 1.7-1.5 2-3.5.3-1.8.5-3.3 1.2-4.8.7-1.5 1.5-2.9 1.5-5 0-2.7-1.7-4.7-4.2-4.7-1.8 0-3.4.8-4.8 2.1z" />
    </svg>
  )
}

export default ToothIcon
