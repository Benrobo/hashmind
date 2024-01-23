import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { GPT_RESP_STYLE_NAME } from "@/types";
import { GPT_RESP_STYLE } from "@/data/gpt";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getGptStyle = (name: GPT_RESP_STYLE_NAME) => {
  const styles = GPT_RESP_STYLE.find((style) => style.name === name);
  return styles;
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};

export function handleBlobToBase64(blob: Blob){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result;
      resolve(base64String);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the Blob as base64.'));
    };

    reader.readAsDataURL(blob);
  });
}