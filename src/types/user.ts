export interface User {
  id: string;
  email: string;
  status: "waitlisted" | "invited" | "active";
}
