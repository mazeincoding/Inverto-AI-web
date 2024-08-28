export interface Announcement {
  id: string;
  title: string | null;
  summary: string | null;
  version: string;
  created_at: string;
  additional_info: string | null;
  changes: string[];
  updated_at: string;
}
