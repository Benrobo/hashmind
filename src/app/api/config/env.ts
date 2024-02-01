const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:2025"
    : "https://hashmind.vercel.app";
const env = {
  API_URL,
  GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ELEVENLAB_API_KEY: process.env.ELEVENLAB_API_KEY,
  STABILITY_API_KEY: process.env.STABILITY_API_KEY,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
  NOTION: {
    redirect_url: process.env.NOTION_AUTH_URL,
    client_id: process.env.NOTION_CLIENT_ID,
    secret: process.env.NOTION_SECRET_KEY,
  },
};

export default env;
