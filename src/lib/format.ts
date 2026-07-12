import { APP_TIMEZONE } from "@shared/constants";

export function parseAppDate(value: string): Date {
  if (value.includes(" ") && !value.includes("T")) {
    return new Date(value.replace(" ", "T") + "Z");
  }

  return new Date(value);
}

export function formatDisplayDate(
  date = new Date(),
  timezone = APP_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export function formatDateTime(
  value: string,
  timezone = APP_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parseAppDate(value));
}

export function formatRelativeTime(
  value: string,
  timezone = APP_TIMEZONE,
): string {
  const date = parseAppDate(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 1000 / 60);

  if (diffMinutes <= 1) {
    return "刚刚";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} 小时前`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} 天前`;
  }

  return formatDateTime(value, timezone);
}

export function formatDelta(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

export function formatProgress(value: number): string {
  return `${Math.round(value)}%`;
}
