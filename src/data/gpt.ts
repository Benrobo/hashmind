import { GPT_PROMPTS, GPT_RESP_STYLE_TYPE } from "@/types";

// blog response style
export const GPT_RESP_STYLE = [
  {
    name: "author_style",
    title: "Author Style",
    emoji: "🎩",
    isAuthor: true,
    styles: [
      {
        name: "malcolm_gladwell",
        title: "Malcolm Gladwell",
        emoji: "🤔",
        default: false,
      },
      {
        name: "dan_ariely",
        title: "Dan Ariely",
        emoji: "🧠",
        default: true,
      },
      {
        name: "brene_brown",
        title: "Brené Brown",
        emoji: "💖",
        default: false,
      },
      {
        name: "jane_austen",
        title: "Jane Austen",
        emoji: "🎩👒",
        default: false,
      },
      {
        name: "gabriel_garcia_marquez",
        title: "Gabriel Garcia Marquez",
        emoji: "🌌",
        default: false,
      },
      {
        name: "seth_godin",
        title: "Seth Godin",
        emoji: "🚀",
        default: false,
      },
    ],
  },
  {
    name: "casual_conversation",
    title: "Casual Conversation",
    emoji: "😄",
    isAuthor: false,
    styles: [],
  },
  {
    name: "tutorials_and_guide",
    title: "Tutorials and Guide",
    emoji: "📚",
    isAuthor: false,
    styles: [],
  },
  {
    name: "informative_and_newsy",
    title: "Informative and Newsy",
    emoji: "📰",
    isAuthor: false,
    styles: [],
  },
] satisfies GPT_RESP_STYLE_TYPE[];

export const GPT_CUSTOM_PROMPT = [
  {
    name: "casual_conversation",
    prompt:
      "Write in a conversational and casual tone, making the content easy-going and relatable. Inject a sense of friendliness and approachability into the text.",
  },
  {
    name: "author_style",
    prompt: "Write a paragraph in the style of {{author_name}}.",
  },
  {
    name: "informative_and_newsy",
    prompt:
      "Write a paragraph delivering informative and newsy content. Provide facts, updates, or insights on a relevant topic.",
  },
  {
    name: "tutorials_and_guide",
    prompt:
      "Create a tutorial or guide that provides step-by-step instructions on a specific topic. Ensure clarity and coherence in conveying information.",
  },
] satisfies GPT_PROMPTS[];
