/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
      },
      {
        hostname: "cdn.hashnode.com",
      },
      { hostname: "prod-files-secure.s3.us-west-2.amazonaws.com" },
    ],
  },
};

module.exports = nextConfig;
