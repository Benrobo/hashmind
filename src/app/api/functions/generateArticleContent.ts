import { AUTHOR_NAMES, GPT_RESP_STYLE_NAME, RESPONSE_CODE } from "@/types";
import { Role, updateMindInfo } from "../utils/genConversation";
import { getGptStyle } from "@/lib/utils";
import openai from "../config/openai";
import HttpException from "../utils/exception";

type Props = {
  title: string;
  subtitle: string;
  chatHistory: string;
  userReq: {
    style: GPT_RESP_STYLE_NAME;
    author: null | AUTHOR_NAMES;
  }; // user request
  context: string; // context of the article
};

// just to prevent costs usage
const tempContent =
  "# Why Artificial Intelligence is the future of humanity and how it won't change the world\n" +
  "\n" +
  "Hey there! Have you ever wondered about the incredible potential of Artificial Intelligence (AI) and what it means for the future of humanity? Well, let's dive into it together and explore the promise and limitations of AI, because there's a lot to unpack here!\n" +
  "\n" +
  "## Embracing the Promise of AI\n" +
  "\n" +
  "AI has already made a significant impact in various fields, from healthcare to finance, and even in our daily lives. With its ability to analyze massive amounts of data and identify patterns, AI has the potential to revolutionize how we work, live, and interact with the world around us.\n" +
  "\n" +
  "One of the most exciting promises of AI is its potential to enhance efficiency and productivity. Through automation and predictive analytics, AI can streamline processes, freeing up human resources to focus on more complex and creative tasks. Imagine a world where routine tasks are handled by AI, allowing us to channel our energy into innovation and problem-solving!\n" +
  "\n" +
  "Moreover, in the medical field, AI is empowering researchers and practitioners to make groundbreaking discoveries and provide more personalized care. From early disease detection to drug development, the possibilities are truly remarkable.\n" +
  "\n" +
  "## The Limitations and Ethical Considerations\n" +
  "\n" +
  "While the potential of AI is undeniably exciting, it's crucial to acknowledge its limitations and the ethical considerations that come with its development and deployment.\n" +
  "\n" +
  "One of the main limitations of AI lies in its ability to truly understand and interpret context. As advanced as AI may be, it still lacks the nuanced understanding and emotional intelligence that humans possess. This can pose significant challenges, especially in fields that require empathy, creativity, and moral judgment.\n" +
  "\n" +
  "Additionally, the ethical implications of AI cannot be overlooked. Issues such as data privacy, algorithmic bias, and job displacement require careful consideration and regulation to ensure that AI is developed and utilized responsibly.\n" +
  "\n" +
  "## Balancing the Impact\n" +
  "\n" +
  "So, does this mean AI won't change the world? Not exactly. While AI may not completely transform the world as we know it, its impact will be profound and multifaceted. As we navigate the integration of AI into our society, it's essential to strike a balance between embracing its potential and addressing its limitations and ethical challenges.\n" +
  "\n" +
  "By cultivating a thoughtful and informed approach to AI development and implementation, we can harness its power to drive positive change while safeguarding against potential pitfalls.\n" +
  "\n" +
  "In conclusion, the future of humanity is undoubtedly intertwined with AI, but it's not a one-size-fits-all solution to our global challenges. As we continue to explore and refine the capabilities of AI, let's approach its integration with a keen awareness of its promise and limitations, ensuring that we steer its course toward a future that benefits all of humanity.\n" +
  "\n" +
  "So, what are your thoughts on the promise and limitations of AI? Let's discuss! 😊";

export default async function generateArticleContent({
  title,
  subtitle,
  chatHistory,
  context,
  userReq,
}: Props) {
  try {
    const gptStyle = getGptStyle(userReq.style);
    const formattedUserReq = `
    Generate an article with the following information below: 
        title "${title}"
        subtitle "${subtitle}" 
        in the style of ${gptStyle?.title} ${
      gptStyle?.isAuthor ? `and the author ${userReq.author}` : ""
    }.
    `;
    const conversation: { role: Role; content: string }[] = [
      {
        role: "system",
        content: updateMindInfo(context, chatHistory),
      },
      {
        role: "user",
        content: formattedUserReq,
      },
    ];

    // ! Uncommment this once you;re done.
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo-1106",
    //   messages: conversation as any,
    //   max_tokens: 1000,
    //   temperature: 0.9,
    // });

    // const content = response.choices[0].message.content;
    return {
      // content,
      content: tempContent,
    };
  } catch (e: any) {
    const msg = e.message;
    console.log(msg, e);

    throw new HttpException(
      RESPONSE_CODE.ERROR_GENERATING_CONTENT,
      `Error generating article content`,
      400
    );
  }
}
