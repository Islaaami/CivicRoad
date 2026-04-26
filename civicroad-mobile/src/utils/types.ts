export type User = {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  bio: string;
  municipality?: string | null;
  profile_image_url?: string | null;
  push_token?: string | null;
};

export type UploadableImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type Category = {
  id: number;
  name: string;
};

export type ReportStatus = "pending" | "in_progress" | "resolved";

export type ReportImage = {
  id: number;
  url: string;
};

export type Report = {
  id: number;
  citizen_id: number | null;
  category_id: number | null;
  category_name?: string | null;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  municipality?: string | null;
  status: ReportStatus;
  created_at: string;
  image_url?: string | null;
  images?: ReportImage[];
};
