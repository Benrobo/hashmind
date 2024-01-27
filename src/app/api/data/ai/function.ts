// any related data for functions calling would be added here

export const supportedActions = [
  "CREATE_BLOG",
  "READ_BLOG",
  "UPDATE_BLOG",
  "DELETE_BLOG",
  "LIST_BLOGS",
];

export const actionsVariants = {
  create: ["CREATE_BLOG", "CREATE_POST", "CREATE_ARTICLE", "CREATE", "create"],
  update: ["UPDATE_BLOG", "UPDATE_POST", "UPDATE_ARTICLE", "UPDATE", "update"],
  delete: ["DELETE_BLOG", "DELETE_POST", "DELETE_ARTICLE", "DELETE", "delete"],
};

export const updateBlogContentNotation = ["ADD", "REMOVE", "REPLACE"];
