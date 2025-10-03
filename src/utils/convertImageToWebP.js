// Enhanced image conversion utility functions
export const convertImageToWebP = (
  file,
  quality = 0.8,
  maxWidth = 400,
  maxHeight = 400,
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      // Scale down if image is larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new File object with WebP extension
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              { type: "image/webp" },
            );

            const originalKB = (file.size / 1024).toFixed(2);
            const newKB = (webpFile.size / 1024).toFixed(2);
            const reduction = ((1 - webpFile.size / file.size) * 100).toFixed(
              1,
            );

            resolve(webpFile);
          } else {
            reject(new Error("Failed to convert image to WebP"));
          }
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

// Enhanced GIF handler - Convert GIF to WebP for static images
export const handleGifConversion = async (
  file,
  quality = 0.7,
  maxWidth = 400,
  maxHeight = 400,
) => {
  // Check if it's an animated GIF or static
  const isAnimated = await checkIfGifIsAnimated(file);

  if (isAnimated) {
    // For animated GIFs, just resize but keep as GIF
    return await compressGif(file, maxWidth, maxHeight);
  } else {
    // For static GIFs, convert to WebP for much better compression
    return await convertImageToWebP(file, quality, maxWidth, maxHeight);
  }
};

// Check if GIF is animated
export const checkIfGifIsAnimated = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result);

      // Look for multiple image frames in GIF
      let imageCount = 0;
      for (let i = 0; i < arr.length - 2; i++) {
        if (arr[i] === 0x00 && arr[i + 1] === 0x21 && arr[i + 2] === 0xf9) {
          imageCount++;
          if (imageCount > 1) {
            resolve(true); // Animated
            return;
          }
        }
      }
      resolve(false); // Static
    };
    reader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 64 * 1024))); // Read first 64KB
  });
};

// Compress GIF while keeping animation
export const compressGif = (file, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Scale down dimensions
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert back to GIF with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedGif = new File([blob], file.name, {
              type: "image/gif",
            });

            const originalKB = (file.size / 1024).toFixed(2);
            const newKB = (compressedGif.size / 1024).toFixed(2);
            const reduction = (
              (1 - compressedGif.size / file.size) *
              100
            ).toFixed(1);

            resolve(compressedGif);
          } else {
            reject(new Error("Failed to compress GIF"));
          }
        },
        "image/gif",
        0.8, // GIF quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load GIF"));
    img.src = URL.createObjectURL(file);
  });
};

// Smart converter - handles all formats optimally
export const smartImageConverter = async (file, targetMaxSize = 200) => {
  const targetMaxSizeBytes = targetMaxSize * 1024; // Convert KB to bytes
  const originalSizeKB = (file.size / 1024).toFixed(2);

  let processedFile = file;

  // Handle different file types
  if (file.type === "image/gif") {
    processedFile = await handleGifConversion(file, 0.7, 400, 400);
  } else if (file.type !== "image/webp") {
    // Convert other formats to WebP
    let quality = 0.8;

    // Adjust quality based on how much we need to compress
    if (file.size > 1024 * 1024) {
      // > 1MB
      quality = 0.6;
    } else if (file.size > 512 * 1024) {
      // > 512KB
      quality = 0.7;
    }

    processedFile = await convertImageToWebP(file, quality, 400, 400);
  }

  // If still too large, apply aggressive compression
  let attempts = 0;
  const maxAttempts = 3;

  while (processedFile.size > targetMaxSizeBytes && attempts < maxAttempts) {
    attempts++;

    const aggressiveQuality = Math.max(0.3, 0.8 - attempts * 0.2);
    const smallerDimension = Math.max(200, 400 - attempts * 100);

    if (processedFile.type === "image/gif") {
      processedFile = await compressGif(
        file,
        smallerDimension,
        smallerDimension,
      );
    } else {
      processedFile = await convertImageToWebP(
        file,
        aggressiveQuality,
        smallerDimension,
        smallerDimension,
      );
    }
  }

  const finalSizeKB = (processedFile.size / 1024).toFixed(2);
  const totalReduction = ((1 - processedFile.size / file.size) * 100).toFixed(
    1,
  );

  return processedFile;
};
