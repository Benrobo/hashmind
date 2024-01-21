"use client";
import {
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowEnd,
  FlexRowStart,
} from "@/components/flex";
import { useDataContext } from "@/context/DataContext";
import { ExternalLink, MoveLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function BlogContent() {
  const { showToolBar, setActivePage } = useDataContext();

  React.useEffect(() => {
    showToolBar();
    setActivePage("content");
  }, []);
  return (
    <FlexColStart className="w-full h-full">
      <FlexColStart className="w-full px-4 py-4">
        <Link href="/dashboard/home">
          <MoveLeft
            className="text-white-100 p-2 rounded-md bg-dark-100 "
            size={30}
          />
        </Link>
        <p className="font-ppSB text-xl text-white-100">Generated Content</p>
        <p className="text-white-400 font-ppReg text-xs">
          All your AI generated content will be listed here.
        </p>
      </FlexColStart>
      <FlexColStart className="w-full px-4 py-2 gap-2">
        <AIGeneratedBlogContent
          id="1"
          title="Blog Title"
          subHeading="Blog Sub Heading"
          url="https://blog.com"
        />
      </FlexColStart>
    </FlexColStart>
  );
}

type AIGeneratedBlogContentProps = {
  id: string;
  title: string;
  subHeading?: string;
  url: string;
};

function AIGeneratedBlogContent({
  id,
  title,
  subHeading,
  url,
}: AIGeneratedBlogContentProps) {
  return (
    <FlexRowStart className="w-full p-2 bg-dark-100 rounded-md">
      <span className="text-3xl px-4 py-3 bg-dark-300 rounded-lg">🚀</span>
      <FlexColStart className="w-full gap-0">
        <h1 className="font-ppSB text-md text-white-100">{title}</h1>
        <p className="font-ppReg text-xs text-white-100/70">{subHeading}</p>
      </FlexColStart>
      <FlexRowEnd className="w-fit py-3 px-4">
        <a href="#" target="_blank" className="text-white-100">
          <ExternalLink size={15} />
        </a>
        <a href="#" target="_blank" className="text-white-100">
          <Pencil size={15} />
        </a>
        <button className="text-red-305">
          <Trash2 size={15} />
        </button>
      </FlexRowEnd>
    </FlexRowStart>
  );
}
