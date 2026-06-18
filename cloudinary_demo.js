require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Cloudinary API credentials are required in environment variables.");
}

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'desbejpys',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function runDemo() {
  try {
    console.log('Uploading image...');
    
    // 2. Upload an image from Cloudinary demo domain
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      { public_id: 'sample_shoes' }
    );
    
    console.log('\n--- Upload Successful ---');
    console.log(`Public ID: ${uploadResult.public_id}`);
    console.log(`Secure URL: ${uploadResult.secure_url}`);
    
    // 3. Get image details
    console.log('\n--- Image Metadata ---');
    console.log(`Width: ${uploadResult.width}px`);
    console.log(`Height: ${uploadResult.height}px`);
    console.log(`Format: ${uploadResult.format}`);
    console.log(`Size: ${uploadResult.bytes} bytes`);
    
    // 4. Transform the image
    // f_auto: Automatically delivers the image in the most optimal format (e.g., WebP or AVIF) based on the requesting browser.
    // q_auto: Automatically adjusts compression to minimize file size without visible degradation.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });
    
    console.log('\n--- Image Transformation ---');
    console.log('Done! Click link below to see optimized version of the image. Check the size and the format.');
    console.log(transformedUrl);

  } catch (error) {
    console.error('Error during Cloudinary operations:', error);
  }
}

runDemo();
