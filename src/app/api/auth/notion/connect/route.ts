import { redirect } from "next/navigation";

export const GET = async () => {
  redirect(process.env.NOTION_AUTH_URL!);
};
