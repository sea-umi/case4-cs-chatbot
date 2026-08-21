import type { ReactNode } from "react";

type IconName = "inbox" | "clock" | "check" | "chart" | "settings" | "search" | "chevronDown" | "chevronLeft" | "chevronRight" | "arrowUp" | "paperclip" | "smile" | "send" | "more" | "phone" | "mail" | "warning" | "tag" | "close" | "sparkle" | "external";

export function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    inbox: <><path d="M4 4.8A1.8 1.8 0 0 1 5.8 3h12.4A1.8 1.8 0 0 1 20 4.8v14.4a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 19.2z" /><path d="M4 14h4l1.5 2h5L16 14h4" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    check: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.3 2.3 4.8-5" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
    settings: <><path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z" /><path d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3.1 1.3v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3.1-1.3l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1A1.8 1.8 0 0 0 3.3 12a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 1.3-3.1l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3.1-1.3v-.2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3.1 1.3l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 1.3 3.1h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-1.3 3.1Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></>,
    chevronDown: <path d="m7 9.5 5 5 5-5" />, chevronLeft: <path d="m14.5 6-6 6 6 6" />, chevronRight: <path d="m9.5 6 6 6-6 6" />, arrowUp: <><path d="M12 19V5" /><path d="m6.5 11.5 5.5-6 5.5 6" /></>,
    paperclip: <path d="m20 11.2-8.4 8.4a5 5 0 0 1-7-7l8.8-8.8a3.3 3.3 0 0 1 4.7 4.7l-8.8 8.8a1.7 1.7 0 1 1-2.4-2.4l8.2-8.2" />, smile: <><circle cx="12" cy="12" r="8.5" /><path d="M8.5 14.5a4.2 4.2 0 0 0 7 0" /><path d="M8.7 9.8h.1M15.2 9.8h.1" /></>, send: <><path d="m21 3-7.6 18-3.1-7.3L3 10.6z" /><path d="M10.3 13.7 21 3" /></>, more: <><circle cx="5" cy="12" r=".8" fill="currentColor" /><circle cx="12" cy="12" r=".8" fill="currentColor" /><circle cx="19" cy="12" r=".8" fill="currentColor" /></>,
    phone: <path d="M5.5 4.5 8.1 3l2.1 4.7-2 1.3a14 14 0 0 0 6.8 6.8l1.3-2 4.7 2.1-1.5 2.6a2.7 2.7 0 0 1-3 1.3C9.7 17.7 6.3 14.3 4.2 7.5a2.7 2.7 0 0 1 1.3-3Z" />, mail: <><rect x="3.5" y="5" width="17" height="14" rx="1.8" /><path d="m4.5 7 7.5 5 7.5-5" /></>, warning: <><path d="m12 3 9 16H3z" /><path d="M12 9v4M12 16h.01" /></>, tag: <><path d="M4 5.5V10l8.5 8.5a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8L11 3H6.5A2.5 2.5 0 0 0 4 5.5Z" /><circle cx="8" cy="7.5" r="1" /></>, close: <><path d="m6 6 12 12M18 6 6 18" /></>, sparkle: <><path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2z" /><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6z" /></>, external: <><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}
