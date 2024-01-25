import { serve } from "inngest/next";
import { inngest } from "@/app/api/config/inngest_client";
import { inngest_article_creation_function } from "@api/jobs/inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [inngest_article_creation_function],
});
