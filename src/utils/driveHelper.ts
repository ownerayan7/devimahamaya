/**
 * Utilities for extracting and converting Google Drive image & video links
 */

export function extractDriveFileId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/...
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (matchFileD) return matchFileD[1];

  // Pattern 2: ?id=FILE_ID or &id=FILE_ID
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (matchIdParam) return matchIdParam[1];

  // Pattern 3: lh3.googleusercontent.com/d/FILE_ID
  const matchLh3 = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/);
  if (matchLh3) return matchLh3[1];

  // Pattern 4: Plain Google Drive ID
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function getDriveDirectImageUrl(input: string): string {
  const driveId = extractDriveFileId(input);
  if (driveId) {
    return `https://drive.google.com/uc?export=view&id=${driveId}`;
  }
  return input.trim();
}

export function getDriveVideoEmbedUrl(input: string): string {
  const driveId = extractDriveFileId(input);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  return input.trim();
}

export function parseBulkDriveInput(text: string): string[] {
  if (!text) return [];
  const lines = text.split(/[\n,\r]+/);
  const results: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    results.push(getDriveDirectImageUrl(trimmed));
  }

  return results;
}

