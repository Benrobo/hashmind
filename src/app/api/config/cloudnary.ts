import cloudinary from "cloudinary";
import env from "./env";

cloudinary.v2.config({
  cloud_name: "dmi4vivcw",
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_SECRET,
});

export default cloudinary;
