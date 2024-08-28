export function format_relative_time(date_string: string): string {
  const date = new Date(date_string);
  const now = new Date();
  const diff_ms = now.getTime() - date.getTime();
  const diff_days = Math.floor(diff_ms / (1000 * 60 * 60 * 24));
  const diff_weeks = Math.floor(diff_days / 7);
  const diff_months =
    (now.getFullYear() - date.getFullYear()) * 12 +
    now.getMonth() -
    date.getMonth();
  const diff_years = now.getFullYear() - date.getFullYear();

  if (diff_days === 0) {
    return `Today at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } else if (diff_days === 1) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } else if (diff_days < 7) {
    return `${diff_days} days ago`;
  } else if (diff_weeks < 4) {
    return diff_weeks === 1 ? "1 week ago" : `${diff_weeks} weeks ago`;
  } else if (diff_months < 12) {
    return diff_months === 1 ? "1 month ago" : `${diff_months} months ago`;
  } else {
    return diff_years === 1 ? "1 year ago" : `${diff_years} years ago`;
  }
}
