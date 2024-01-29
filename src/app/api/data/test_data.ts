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
  "Hi, I need you to delete the previous article you wrote on the topic Why Artificial Intelligence is the future of humanity and how it won't change the world.";

//   "Hi, so I need you to update one of my article on hashnode with the title Why Artificial Intelligence is the future of humanity and how it won't change the world. Update the section of the article that talks about the limitations of AI. I want you to add a new section that talks about the promise of AI. Also, add a new cover image depicting a Utopian future where AI live in harmony with humans.";
