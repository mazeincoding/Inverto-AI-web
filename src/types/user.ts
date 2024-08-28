export interface User {
  id: string;
  email: string;
  status: "waitlisted" | "invited" | "active";
}

export interface UnseenAnnouncement {
  id: number;
  title: string;
  summary: string;
  version: string;
  created_at: string;
}
