/**
 * File Converter Utility
 * Reads uploaded video/audio/image Files as persistent Data URLs (base64)
 * so media can be shared and played seamlessly across all devices.
 */

export function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to data URL.'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
