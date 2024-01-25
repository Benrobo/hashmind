import { serve } from "inngest/next";
import { inngest } from "@/app/api/config/inngest_client";
import {
  inngest_article_coverimage_generation_function,
  inngest_article_metadata_creation_function,
  inngest_hashmind_main_function,
} from "@api/jobs/inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    inngest_hashmind_main_function,
    inngest_article_metadata_creation_function,
    inngest_article_coverimage_generation_function,
  ],
});
