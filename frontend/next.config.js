/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',  // Cloudinary images
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',    // S3 (if used later)
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Placeholder/stock images
      },
    ],
  },
};

module.exports = nextConfig;