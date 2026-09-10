export interface PresignedUpload {
  uploadUrl: string;
  storageKey: string;
  contentType: string;
  expiresAtUtc: string;
}
