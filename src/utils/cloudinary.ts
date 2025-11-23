import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

export async function uploadImage(imageUrl: string): Promise<string> {
    try {
      const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: "groups_posters",
        resource_type: "auto",
        transformation: [
          { width: 1200, height: 730, crop: 'fit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
      return uploadResponse.secure_url;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Internal Server Error";
      return error
    }
  }

  export async function uploadVideo(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
            folder: "course_videos",
            resource_type: "video",
            chunk_size: 6000000, 
            eager: [
                { 
                    streaming_profile: "hd", 
                    format: "m3u8" 
                }
            ],
            eager_async: true,
        });

        return uploadResponse.secure_url;
    } catch (err) {
        const error = err instanceof Error ? err.message : "Video upload failed";
        throw new Error(error);
    }
}

export const uploadMultipleImages = async (imagesBase64: string[]): Promise<string[]> => {
  try {
    const uploadPromises = imagesBase64.map(async (imageBase64, index) => {
      const result = await cloudinary.uploader.upload(imageBase64, {
        folder: 'events',
        resource_type: 'image',
        public_id: `event_${Date.now()}_${index}`,
      });
      return result.secure_url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;
  } catch (error) {
    throw error;
  }
};

export async function uploadCertificates(files: File[]): Promise<string[]> {
  try {
    // Validate files
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    // Allowed file types for certificates
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // Validate each file
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Only PDF, images, and documents are allowed.`);
      }
      
      // Max file size: 10MB
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }
    }

    // Upload all files in parallel
    const uploadPromises = files.map(async (file, index) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Generate unique public_id
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

      const result = await cloudinary.uploader.upload(dataUrl, {
        folder: 'donation_certificates',
        resource_type: 'auto', // Automatically detects file type
        public_id: `cert_${timestamp}_${randomId}_${sanitizedFileName}`,
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ],
        // Optional: Add tags for easier management
        tags: ['donation', 'certificate', `upload_${timestamp}`]
      });

      return result.secure_url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;
  } catch (error) {
    console.error('Certificate upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload certificates';
    throw new Error(errorMessage);
  }
}


export async function uploadSingleCertificate(file: File): Promise<string> {
  const urls = await uploadCertificates([file]);
  return urls[0];
}


export async function deleteCertificate(url: string): Promise<void> {
  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `donation_certificates/${filename.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto'
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw new Error('Failed to delete certificate');
  }
}

export default cloudinary;