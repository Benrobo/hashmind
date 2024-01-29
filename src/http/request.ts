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

// Content Metadata
export const getContents = async () => {
  const req = await $axios.get("/user/blog/content");
  return req.data;
};

export const deleteContent = async (data: any) => {
  const req = await $axios.post("/user/blog/content", data);
  return req.data;
};
