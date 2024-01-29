// this contains the test data for all services / functions
// Just a hack i USE to prevent further costs usage.

export const userActionTestData = {
  // error: null,
  // action: "CREATE_BLOG",
  // title:
  //   "Why Artificial Intelligence is the future of humanity and how it won't change the world",
  // emoji: "🤖",
  // subtitle: "Exploring the Promise and Limitations of AI",
  // aiMsg: null,
  // keywords:
  //   "Artificial Intelligence, future, humanity, limitations, promise",

  // update
  functions: ["identify_action", "identify_update_blog_action"],
  error: null,
  //   action: "UPDATE_BLOG",
  action: "DELETE_BLOG",
  // title: null,
  // title: "Why Artificial Intelligence is the future of humanity",
  title: "Test title 1.",
  emoji: null,
  subtitle: null,
  keywords: null,
  aiMsg: null,
  //   generate a new title
  updateTitle: "Artificial Intelligence, the future of humanity.",
  // updateTitle: null,
  // updateContent: "limitations of AI, promise of AI",
  updateContent: null,
  updateSubtitle: null,
  // updateSubtitle: "Discussing the impact of AI on society and human life",
  //   updateCoverImage: null,
  updateCoverImage: "Utopian future, AI, harmony",
  updateContentNotation: "ADD",
};

export const transcriptTestData =
  "Hi, I need you to create an article on the topic Building and Validating Web Endpoints with Fiber in Golang. ";
  // "Update the article content with the title The benefit of being an indie hacker. I need you to add an image to the article content where the word 'Autonomy and Creative Control' exists."
  // "Update the cover image of my article titled 'the benefit of being an indie hacker' to depict a computer and freedom."

//   "Hi, so I need you to update one of my article on hashnode with the title Why Artificial Intelligence is the future of humanity and how it won't change the world. Update the section of the article that talks about the limitations of AI. I want you to add a new section that talks about the promise of AI. Also, add a new cover image depicting a Utopian future where AI live in harmony with humans.";

export const tempContent =
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

export const tempUpdatedContent = `
# Why Artificial Intelligence is the future of humanity and how it won't change the world

Hey there! Have you ever wondered about the incredible potential of Artificial Intelligence (AI) and what it means for the future of humanity? Well, let's dive into it together and explore the promise and limitations of AI, because there's a lot to unpack here!

## Embracing the Promise of AI

AI has already made a significant impact in various fields, from healthcare to finance, and even in our daily lives. With its ability to analyze massive amounts of data and identify patterns, AI has the potential to revolutionize how we work, live, and interact with the world around us.

One of the most exciting promises of AI is its potential to enhance efficiency and productivity. Through automation and predictive analytics, AI can streamline processes, freeing up human resources to focus on more complex and creative tasks. Imagine a world where routine tasks are handled by AI, allowing us to channel our energy into innovation and problem-solving!

Moreover, in the medical field, AI is empowering researchers and practitioners to make groundbreaking discoveries and provide more personalized care. From early disease detection to drug development, the possibilities are truly remarkable.

## The Limitations and Ethical Considerations

While the potential of AI is undeniably exciting, it's crucial to acknowledge its limitations and the ethical considerations that come with its development and deployment.

One of the main limitations of AI lies in its ability to truly understand and interpret context. As advanced as AI may be, it still lacks the nuanced understanding and emotional intelligence that humans possess. This can pose significant challenges, especially in fields that require empathy, creativity, and moral judgment.

Additionally, the ethical implications of AI cannot be overlooked. Issues such as data privacy, algorithmic bias, and job displacement require careful consideration and regulation to ensure that AI is developed and utilized responsibly.

## Balancing the Impact

So, does this mean AI won't change the world? Not exactly. While AI may not completely transform the world as we know it, its impact will be profound and multifaceted. As we navigate the integration of AI into our society, it's essential to strike a balance between embracing its potential and addressing its limitations and ethical challenges.

By cultivating a thoughtful and informed approach to AI development and implementation, we can harness its power to drive positive change while safeguarding against potential pitfalls.

In conclusion, the future of humanity is undoubtedly intertwined with AI, but it's not a one-size-fits-all solution to our global challenges. As we continue to explore and refine the capabilities of AI, let's approach its integration with a keen awareness of its promise and limitations, ensuring that we steer its course toward a future that benefits all of humanity.

So, what are your thoughts on the promise and limitations of AI? Let's discuss! 😊
`;
