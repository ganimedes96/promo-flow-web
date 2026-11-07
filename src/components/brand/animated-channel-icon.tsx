import styles from "./animated-channel-icon.module.css";

export function AnimatedChannelIcon({
  platform,
  compact = false,
}: {
  platform: "whatsapp" | "telegram";
  compact?: boolean;
}) {
  const telegram = platform === "telegram";
  return (
    <span
      aria-hidden="true"
      className={`${styles.icon} ${compact ? styles.compact : ""} ${telegram ? styles.telegram : styles.whatsapp}`}
    >
      <svg
        className="size-full"
        viewBox="0 0 48 48"
        width="44"
        height="44"
        fill="none"
        focusable="false"
      >
        <circle
          className={styles.ripple}
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          className={`${styles.ripple} ${styles.delayed}`}
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="24" cy="24" r="21" fill="currentColor" />
        <circle cx="24" cy="24" r="20" stroke="white" strokeOpacity=".18" />
        {telegram ? (
          <>
            <g
              className={styles.trail}
              stroke="white"
              strokeLinecap="round"
              strokeWidth="1.5"
            >
              <path d="M9 29h7" />
              <path d="M11 33h5" />
              <path d="M8 25h4" />
            </g>
            <g className={styles.plane}>
              <path
                d="m11 23 24-10c1.2-.5 1.8.2 1.5 1.5L32 35c-.2 1-1 1.3-1.8.7l-7-5.1-3.5 3.3c-.4.4-.8.5-1-.2l-2-6.7-5.4-1.7c-1.3-.4-1.3-1.2-.3-1.6Z"
                fill="white"
              />
              <path d="m17 27 15-10-11.3 12.1-.7 4.5-1.3.8Z" fill="#C7E9F9" />
              <path d="m20.7 29.1 2.5 1.5-3.5 3.3Z" fill="#8BCDEB" />
            </g>
          </>
        ) : (
          <>
            <g className={styles.bubble}>
              <path
                d="M35.5 23.6a11.5 11.5 0 0 1-17 10.1l-6 1.7 1.7-5.8a11.5 11.5 0 1 1 21.3-6Z"
                stroke="white"
                strokeWidth="2.1"
                strokeLinejoin="round"
              />
              <path
                className={styles.phone}
                d="m19 17.8-1.2.3c-.9.3-1.3 1.2-1 2.2 1.6 5.3 5.1 8.8 10.4 10.3 1 .3 1.9-.1 2.2-1l.3-1.2c.1-.4 0-.7-.4-.9l-2.6-1.2c-.4-.2-.7-.1-.9.2l-1 1.1a12.2 12.2 0 0 1-5.3-5.3l1.1-1c.3-.2.4-.6.2-.9l-1.2-2.3c-.1-.3-.4-.4-.6-.3Z"
                fill="white"
              />
            </g>
            <g className={styles.spark} fill="white">
              <circle cx="36" cy="11" r="1.6" />
              <circle cx="39" cy="16" r=".9" />
            </g>
          </>
        )}
      </svg>
    </span>
  );
}
