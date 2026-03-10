export interface Env {
  DB: D1Database;
  ASSETS_BUCKET: R2Bucket;
}

export interface AssetRecord {
  id: string;
  title: string;
  description: string | null;
  object_key: string;
  file_name: string;
  content_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface AssetPayload {
  title?: string;
  description?: string | null;
  fileName?: string;
  contentType?: string;
  fileBase64?: string;
}

export interface TodoRecord {
  id: string;
  title: string;
  description: string | null;
  is_completed: number;
  image_object_key: string | null;
  image_file_name: string | null;
  image_content_type: string | null;
  image_file_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface TodoPayload {
  title?: string;
  description?: string | null;
  isCompleted?: boolean;
  imageFileName?: string;
  imageContentType?: string;
  imageBase64?: string;
  removeImage?: boolean;
}
