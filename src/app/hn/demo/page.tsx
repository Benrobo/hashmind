"use client";
import { FlexColStart, FlexRowCenterBtw } from "@/components/flex";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publishArticle } from "@/http/request";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import toast from "react-hot-toast";

export default function HashnodePage() {
  const [blogDetails, setBlogDetails] = React.useState({
    title: "",
    contentMarkdown: "",
    subtitle: "",
  });
  const publishArticleMut = useMutation({
    mutationFn: async (data: any) => await publishArticle(data),
    onSuccess: () => {
      setBlogDetails({
        title: "",
        contentMarkdown: "",
        subtitle: "",
      });
      toast.success("Published.");
    },
    onError: (data: any) => {
      const error = data?.response?.data?.message ?? "Something went wrong!";
      toast.error(error);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlogDetails({ ...blogDetails, [e.target.name]: e.target.value });
  };

  return (
    <FlexColStart className="w-full p-5">
      <h1 className="">Create Article</h1>
      <FlexRowCenterBtw>
        <Input
          type="text"
          placeholder="title"
          name="title"
          onChange={handleChange}
          className="text-dark-100"
        />

        <Input
          type="text"
          placeholder="sub-title"
          name="subtitle"
          onChange={handleChange}
          className="text-dark-100"
        />
      </FlexRowCenterBtw>
      <textarea
        name="contentMarkdown"
        id=""
        cols={40}
        rows={10}
        className="w-full text-dark-100 px-3 py-2 "
        placeholder="description"
        onChange={handleChange as any}
      ></textarea>
      <br />
      <Button
        onClick={() => {
          publishArticleMut.mutate(blogDetails);
        }}
        isLoading={publishArticleMut.isPending}
        disabled={publishArticleMut.isPending}
      >
        Publish
      </Button>

      <br />
      <br />
      <br />
    </FlexColStart>
  );
}
