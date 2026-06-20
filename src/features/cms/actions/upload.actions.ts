'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using server-side environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageAction(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'Tidak ada berkas gambar yang dipilih.' };
  }

  // Validate file type (only images allowed)
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Berkas yang dipilih harus berupa gambar.' };
  }

  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Ukuran gambar maksimal adalah 5MB.' };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'hilmi_os' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as any);
            }
          }
        ).end(buffer);
      }
    );

    return { 
      success: true, 
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id 
    };
  } catch (error: any) {
    console.error('[Cloudinary Upload Action Error]:', error);
    return { 
      success: false, 
      error: error.message || 'Gagal mengunggah gambar ke Cloudinary.' 
    };
  }
}
