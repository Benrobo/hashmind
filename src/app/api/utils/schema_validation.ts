import zod from "zod";

export const updateBlogStyleSchema = zod.object({
  gpt_style: zod.string(),
  is_author: zod.boolean(),
  author_name: zod.string().optional(),
});

export const pubPreferenceSchema = zod.object({
  preference: zod.enum(["draft", "publish"]),
});

export const updateHashnodeTokenSchema = zod.object({
  token: zod
    .string({
      required_error: "Token is required",
    })
    .refine((val) => val.length > 0, {
      message: "Token shouldn't be empty",
    }),
  pubId: zod
    .string({
      required_error: "Publication Id is required",
    })
    .refine((val) => val.length > 0, {
      message: "Publication Id shouldn't be empty",
    }),
});

export const handleUserRequestSchema = zod.object({
  audio_base64: zod.string().optional(),
  usersIntent: zod.string().optional(),
});

export const publishArticleSchema = zod.object({
  title: zod
    .string({
      required_error: "Title is required",
    })
    .refine((val) => val.length > 0, {
      message: "Title shouldn't be empty",
    }),
  subtitle: zod
    .string({
      required_error: "Subtitle is required",
    })
    .refine((val) => val.length > 0, {
      message: "Subtitle shouldn't be empty",
    }),
  contentMarkdown: zod
    .string({
      required_error: "Content is required",
    })
    .refine((val) => val.length > 0, {
      message: "Content shouldn't be empty",
    }),
  tags: zod.array(zod.object({ id: zod.string() })),
  coverImageOptions: zod
    .object({
      coverImageURL: zod.string(),
    })
    .optional(),
  slug: zod.string(),
  metaTags: zod
    .object({
      title: zod.string(),
      description: zod.string(),
      image: zod.string(),
    })
    .optional(),
});

export const removeContentSchema = zod.object({
  id: zod.string({
    required_error: "Content id is required.",
  }),
});
