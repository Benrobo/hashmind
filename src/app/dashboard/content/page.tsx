"use client";
import {
  FlexColCenter,
  FlexColStart,
  FlexColStartBtw,
  FlexRowCenterBtw,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
} from "@/components/flex";
import { Spinner } from "@/components/spinner";
import { useDataContext } from "@/context/DataContext";
import { deleteContent, getContents } from "@/http/request";
import { cn } from "@/lib/utils";
import { ResponseData } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  MoveLeft,
  Pencil,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import getConfig from "next/config";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";

type ContentMetadata = {
  id: string;
  title: string;
  sub_heading: string;
  emoji: string;
  link: string;
  article_id: string;
};

export default function BlogContent() {
  const { showToolBar, setActivePage } = useDataContext();
  const [contents, setContents] = React.useState<ContentMetadata[]>([]);
  const [contDelId, setContentDelId] = React.useState("");
  const getContentsQuery = useQuery({
    queryKey: ["getContentMetadata"],
    queryFn: async () => await getContents(),
  });

  React.useEffect(() => {
    showToolBar();
    setActivePage("content");

    // fetch content every 5sec
    const intervalId = setInterval(() => {
      // getContentsQuery.refetch();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    if (getContentsQuery?.error) {
      const data = (getContentsQuery?.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (getContentsQuery.data) {
      const data = getContentsQuery.data as ResponseData;
      const contents = data.data as ContentMetadata[];
      setContents(contents);
    }
  }, [
    getContentsQuery.data,
    getContentsQuery.error,
    getContentsQuery.isPending,
  ]);

  return (
    <FlexColStart className="w-full h-full">
      <FlexColStart className="w-full px-4 py-4">
        <Link href="/dashboard/home">
          <MoveLeft
            className="text-white-100 p-2 rounded-md bg-dark-100 "
            size={30}
          />
        </Link>
        <p className="font-ppSB text-xl text-white-100">Pages</p>
        <p className="text-white-400 font-ppReg text-xs">
          Your notion pages will be listed here.
        </p>
      </FlexColStart>
      <FlexColStart className="w-full px-4 py-2 gap-2 pb-[10em]">
        {getContentsQuery.isLoading && <Spinner />}
        <br />
        <FlexRowStartBtw className="w-full bg-dark-100 rounded-md p-4">
          <FlexRowStart className="">
            <FlexColCenter>
              <Image
                src={"/images/logos/notion.png"}
                width={50}
                height={0}
                className=""
                alt="notion"
              />
            </FlexColCenter>
            <FlexColStart className="w-auto gap-0">
              <p className="font-ppSB text-white-100 text-md">Notion</p>
              <p className="font-ppReg text-white-100/30 text-xs">slug-me</p>
            </FlexColStart>
          </FlexRowStart>
          <FlexRowEnd className="w-auto">
            <FlexColStartBtw className="w-auto">
              <FlexRowEnd className="w-full">
                <button>
                  <Trash2 size={15} className="text-red-305" />
                </button>
                <button>
                  <RefreshCcw
                    size={15}
                    className={cn(
                      "text-blue-101 transition-all",
                      false ? "animate-spin" : ""
                    )}
                  />
                </button>
              </FlexRowEnd>
              <FlexRowStart className="w-auto mt-2">
                <Link
                  href=""
                  className="text-white-100 opacity-[.9] font-ppL text-xs underline">
                  hashnode ↗︎
                </Link>
                <Link
                  href=""
                  className="text-white-100 opacity-[.4] font-ppL text-xs underline">
                  notion ↗︎
                </Link>
              </FlexRowStart>
            </FlexColStartBtw>
          </FlexRowEnd>
        </FlexRowStartBtw>
      </FlexColStart>
    </FlexColStart>
  );
}
