export interface EventUploadRequest {
  event_id?: string;
  name: string;
  media_type?: string;
  metadata?: Record<string, any>;
  file_size?: number;
  has_thumbnail?: boolean;
  thumbnail?: File;
  event?: File;
}

export interface EventUploadResponse {
  success: boolean;
  event_id: string;
  error?: string;
}

export interface EventUploadUrlResponse {
  success: boolean;
  upload_url: string;
  thumbnail_upload_url?: string;
  error?: string;
}
