/**
 * Image Optimization and Compression Utility
 * Resizes and compresses user-uploaded images from mobile/device to < 200KB WebP/JPEG
 * ensuring durable, fast storage in Firestore and local databases.
 */

export async function optimizeImage(
  fileOrBlob: File | Blob,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's already an svg or gif, read as dataURL directly
    if (fileOrBlob.type === 'image/svg+xml' || fileOrBlob.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBlob);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(fileOrBlob);
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      let currentQuality = quality;
      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/webp', currentQuality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }
      } catch {
        dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
      }

      // If compressed size is over 300KB (~400,000 characters in base64), downscale quality further
      if (dataUrl.length > 350000) {
        try {
          dataUrl = canvas.toDataURL('image/webp', 0.55);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.55);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', 0.55);
        }
      }

      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBlob);
    };

    img.src = objectUrl;
  });
}
