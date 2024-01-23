import $axios from "./axios";

export const getUser = async () => {
  const req = await $axios.get("/user");
  return req.data;
};
