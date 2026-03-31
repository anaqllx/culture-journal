export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // 1. Перевірка конфігурації
  if (!cloudName || !uploadPreset) {
    console.error('Cloudinary config is missing!', { cloudName, uploadPreset });
    throw new Error('Cloudinary configuration error');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    // 2. Детальна обробка помилок Cloudinary
    if (!response.ok) {
      console.error('Cloudinary API Error:', data);
      throw new Error(data.error?.message || 'Помилка завантаження зображення');
    }

    // Повертаємо безпечне https посилання
    return data.secure_url;
  } catch (error: any) {
    console.error('Upload process failed:', error);
    throw error;
  }
}