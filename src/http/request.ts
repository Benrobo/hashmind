import $axios from "./axios";

export const getUser = async () => {
  const req = await $axios.get("/user");
  return req.data;
};

export const getUserSettings = async () => {
  const req = await $axios.get("/user/settings");
  return req.data;
};

export const updateGptStyle = async (data: any) => {
  const req = await $axios.patch("/user/gpt_style", data);
  return req.data;
};

export const updateBlogPreference = async (data: any) => {
  const req = await $axios.patch("/user/blog/preference", data);
  return req.data;
};

// hashnode token
export const updateHNToken = async (data: any) => {
  const req = await $axios.patch("/user/settings/hashnode_token", data);
  return req.data;
};

export const checkHnTokenIsAuthorized = async () => {
  const req = await $axios.get("/user/settings/hashnode_token");
  return req.data;
};

// handle user request
export const handleUserRequest = async (data: any) => {
  const req = await $axios.post("/hashmind/request", data);
  return req.data;
};

export const googleTTS = async (data: any) => {
  const req = await $axios.post("/recognition/tts", data);
  return req.data;
};

export const publishArticle = async (data: any) => {
  const req = await $axios.post("/hashmind/article", data);
  return req.data;
};

// Queues
export const getQueues = async () => {
  const req = await $axios.get("/queue");
  return req.data;
};

export const deleteQueue = async (data: any) => {
  const req = await $axios.delete("/queue", { data });
  return req.data;
};

export const syncNotionPage = async (pageId: string) => {
  const req = await $axios.patch(`/notion/page?pageId=${pageId}`);
  return req.data;
};

export const getNotionPages = async () => {
  const req = await $axios.get("/notion/page");
  return req.data;
};

export const getUserHnArticles = async () => {
  const req = await $axios.get("/user/blog/articles");
  return req.data;
};
