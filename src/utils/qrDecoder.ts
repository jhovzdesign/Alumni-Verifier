import jsQR from 'jsqr';

export interface DecodedQRResult {
  value: string;
  imageDataUrl?: string;
}

/**
 * Decodes a QR code from an image File or Blob using HTML5 Canvas and jsQR
 */
export async function decodeQRCodeFromImage(file: File | Blob): Promise<DecodedQRResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        return reject(new Error('Failed to read image file.'));
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            return reject(new Error('Canvas 2D context is not supported in this browser.'));
          }

          // Scale down if massive image to prevent memory exhaustion, while maintaining clarity
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (code && code.data) {
            resolve({
              value: code.data.trim(),
              imageDataUrl: dataUrl
            });
          } else {
            reject(
              new Error(
                'QR CODE COULD NOT BE READ. Please upload a clear QR code image containing a valid QR code.'
              )
            );
          }
        } catch (err: any) {
          reject(
            new Error(
              err.message || 'QR CODE COULD NOT BE READ. Please upload a clear QR code image containing a valid QR code.'
            )
          );
        }
      };

      img.onerror = () => {
        reject(new Error('Invalid image file format.'));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Normalizes QR value, extracting verification token if it's a URL
 */
export function extractVerificationToken(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/verify\/([^\/\?#]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].trim();
  }
  return trimmed;
}
