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
