/**
 * Device Helper Utility for 11 Star Club
 * Generates and persists a unique device identifier to track member uploads.
 */

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';
  
  let deviceId = localStorage.getItem('11star_device_id_v1');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('11star_device_id_v1', deviceId);
  }
  return deviceId;
}

export function isDeviceUploader(itemUploaderDeviceId?: string): boolean {
  if (!itemUploaderDeviceId) return false;
  return getDeviceId() === itemUploaderDeviceId;
}
