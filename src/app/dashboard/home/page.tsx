"use client";
import BlurBgRadial from "@/components/blurBgRadial";
import {
  FlexColStart,
  FlexColStartCenter,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/flex";
import { LineLoader } from "@/components/loader";
import { useDataContext } from "@/context/DataContext";
import { getUserHnArticles } from "@/http/request";
import { ResponseData, UserHnArticles } from "@/types";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Eye, Heart, Library } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { showToolBar, setActivePage, userInfo } = useDataContext();
  const [error, setError] = React.useState<string>("");
  const [articles, setArticles] = React.useState<UserHnArticles[]>([]);

  const getArticlesQuery = useQuery({
    queryKey: ["getArticles"],
    queryFn: async () => await getUserHnArticles(),
    enabled: articles.length === 0,
  });

  React.useEffect(() => {
    showToolBar();
    setActivePage("home");
  }, []);

  const detectUserDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  React.useEffect(() => {
    if (getArticlesQuery?.error) {
      const data = (getArticlesQuery?.error as any)?.response
        ?.data as ResponseData;
      const code = data?.code;
      if (code === "HASHNODE_TOKEN_NOT_FOUND") {
        setError("Please connect your hashnode account.");
      } else {
        toast.error(data?.message ?? "Something went wrong!.");
      }
    }
    if (getArticlesQuery.data) {
      const data = getArticlesQuery.data as ResponseData;
      const articles = data.data as UserHnArticles[];
      setArticles(articles);
    }
  }, [
    getArticlesQuery.data,
    getArticlesQuery.error,
    getArticlesQuery.isPending,
  ]);

  return (
    <FlexColStart className="relative w-full h-full overflow-hidden">
      <div className="w-full h-[100px] p-5 opacity-1 blur-[250px] bg-white-300 absolute z-[1] "></div>
      <FlexRowCenterBtw className="w-full px-4 py-3 z-[20]">
        <h1 className="font-ppEB text-2xl">
          Good {detectUserDay()},
          <br />
          <span className="font-ppSB">{userInfo?.username}</span>
        </h1>
        <div className="">
          <UserButton />
        </div>
      </FlexRowCenterBtw>
      <FlexColStartCenter className="w-full px-4">
        {error && (
          <FlexRowStartCenter className="w-full px-4 py-2 rounded-md bg-red-100/20">
            <p className="text-red-305 font-ppReg text-xs w-full">⚠️ {error}</p>
            <Link href="/dashboard/settings">
              <ChevronRight size={15} />
            </Link>
          </FlexRowStartCenter>
        )}
      </FlexColStartCenter>
      <FlexColStart className="w-full h-screen overflow-y-scroll hideScrollBar2 mt-4 px-4 py-3 pb-[15em]">
        {getArticlesQuery.isLoading && <LineLoader />}
        {!getArticlesQuery.isLoading && articles.length > 0
          ? articles.map((art, i) => (
              <ArticlesCard
                key={i}
                title={art.title}
                coverImage={art.coverImage}
                likes={art.likes ?? 0}
                readtime={art.readTime ?? 0}
                views={art.views ?? 0}
                url={art.url}
              />
            ))
          : !getArticlesQuery.isLoading && (
              <span className="text-xs text-white-100 font-ppReg">
                You have no hashnode articles.
              </span>
            )}
      </FlexColStart>
      <div className="w-full h-[100px] bg-dark-105 backdrop-blur opacity-1 blur-[50px] fixed bottom-0"></div>
    </FlexColStart>
  );
}

type ArticlesCardProps = {
  title: string;
  coverImage: string | null;
  views: number;
  readtime: number;
  likes: number;
  url: string;
};

function ArticlesCard({
  title,
  coverImage,
  views,
  readtime,
  likes,
  url,
}: ArticlesCardProps) {
  return (
    <FlexRowCenterBtw className="w-full px-5 py-4 bg-dark-200 rounded-t-xl rounded-r-lg rounded-l-lg rounded-b-xl ">
      <FlexRowStart className="w-auto">
        <Image
          src={coverImage ? coverImage : "/images/notfound.png"}
          width={75}
          height={75}
          alt="cover image"
          className=" bg-dark-100 rounded-md"
        />
        <FlexColStart className="w-auto gap-0">
          <FlexRowStart className="w-auto pb-2 mt-1">
            <p className="font-ppSB text-xs text-white-300 flex items-start justify-center gap-1">
              <Eye size={15} />
              {views}
            </p>
            <p className="font-ppSB text-xs text-white-300 flex items-start justify-center gap-1">
              <Heart size={15} />
              {likes}
            </p>
            <p className="font-ppSB text-xs text-white-300 flex items-start justify-center gap-1">
              <Library size={15} />
              {readtime} min
            </p>
          </FlexRowStart>
          <Link
            href={url}
            target="_blank"
            className="text-white-100 font-ppSB text-sm underline">
            {title.length > 25 ? title.slice(0, 25) + "..." : title}
          </Link>
          {/* <p className="text-white-300 text-xs font-ppReg">{slug}</p> */}
        </FlexColStart>
      </FlexRowStart>
    </FlexRowCenterBtw>
  );
}
