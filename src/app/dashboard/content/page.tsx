"use client";
import {
  FlexColCenter,
  FlexColStart,
  FlexColStartBtw,
  FlexColStartCenter,
  FlexRowCenterBtw,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
} from "@/components/flex";
import { LineLoader } from "@/components/loader";
import { useDataContext } from "@/context/DataContext";
import { getNotionPages, syncNotionPage } from "@/http/request";
import withAuth from "@/lib/auth-helpers/withAuth";
import { cn } from "@/lib/utils";
import { ResponseData } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MoveLeft, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";

type IntegrationPageData = {
  id: string;
  title: string;
  slug: string;
  url: string;
  article_id: string;
  pageId: string;
  type: "notion" | "hashnode";
  author: string;
  hn_cuid: string; // hashnode editor id (used internally by hashnode)
};

function BlogContent() {
  const { showToolBar, setActivePage } = useDataContext();
  const [intPages, setIntPages] = React.useState<IntegrationPageData[]>([]);
  const [contDelId, setContentDelId] = React.useState<string[]>([]);
  const getIntegrationPageQuery = useQuery({
    queryKey: ["getNotionPage"],
    queryFn: async () => await getNotionPages(),
  });
  const syncNotionPageMut = useMutation({
    mutationFn: async (pageId: string) => syncNotionPage(pageId),
    onSuccess: () => {
      syncNotionPageMut.reset();
      getIntegrationPageQuery.refetch();
      toast.success("Synchronized");
    },
    onError: (error) => {
      syncNotionPageMut.reset();
      const err = (error as any)?.response?.data as ResponseData;
      console.log({ err });
      const msg = err?.message ?? "Something went wrong.";
      toast.error(msg);
    },
  });

  React.useEffect(() => {
    showToolBar();
    setActivePage("content");
  }, []);

  React.useEffect(() => {
    if (getIntegrationPageQuery?.error) {
      const data = (getIntegrationPageQuery?.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (getIntegrationPageQuery.data) {
      const data = getIntegrationPageQuery.data as ResponseData;
      const pages = data.data as IntegrationPageData[];
      setIntPages(pages);
    }
  }, [
    getIntegrationPageQuery.data,
    getIntegrationPageQuery.error,
    getIntegrationPageQuery.isPending,
  ]);

  const syncPage = (pageId: string) => {
    syncNotionPageMut.mutate(pageId);
  };

  return (
    <FlexColStart className="w-full h-full">
      <FlexColStart className="w-full px-4 py-4">
        <Link href="/dashboard/home">
          <MoveLeft
            className="text-white-100 p-2 rounded-md bg-dark-100 "
            size={30}
          />
        </Link>
        <FlexRowStartBtw className="w-full">
          <FlexColStart className="w-full">
            <p className="font-ppSB text-xl text-white-100">Pages</p>
            <p className="text-white-400 font-ppReg text-xs">
              Your notion pages will be listed here.
            </p>
          </FlexColStart>
        </FlexRowStartBtw>
      </FlexColStart>
      <FlexColStart className="w-full px-4 py-2 gap-2 pb-[10em]">
        {getIntegrationPageQuery.isLoading && <LineLoader />}
        <br />

        {/* card */}
        {!getIntegrationPageQuery.isPending && intPages.length > 0
          ? intPages.map((p, i) => (
              <FlexRowStartBtw
                key={i}
                className="w-full bg-dark-100 rounded-md p-4">
                <FlexRowStart className="">
                  <FlexColCenter>
                    <Image
                      src={
                        p.type === "notion" ? "/images/logos/notion.png" : ""
                      }
                      width={50}
                      height={50}
                      className=""
                      alt="notion"
                    />
                  </FlexColCenter>
                  <FlexColStart className="w-auto gap-0">
                    <p className="font-ppSB text-white-100 text-md">
                      {p.title}
                    </p>
                    <p className="font-ppReg text-white-100/30 text-xs">
                      {p.slug}
                    </p>
                  </FlexColStart>
                </FlexRowStart>
                <FlexRowEnd className="w-auto">
                  <FlexColStartBtw className="w-auto">
                    <FlexRowEnd className="w-full">
                      <span className="text-xs font-ppSB text-white-100/50">
                        Sync
                      </span>
                      <button
                        className="group relative"
                        onClick={() => syncPage(p.pageId)}>
                        <RefreshCcw
                          size={15}
                          className={cn(
                            "text-blue-101 transition-all",
                            syncNotionPageMut.isPending ? "animate-spin" : ""
                          )}
                        />
                      </button>
                    </FlexRowEnd>
                    <FlexRowStart className="w-auto mt-2">
                      {p?.hn_cuid && (
                        <Link
                          href={`https://hashnode.com/edit/${p?.hn_cuid}`}
                          target="_blank"
                          className="text-white-100 opacity-[.9] font-ppL text-xs underline">
                          hashnode ↗︎
                        </Link>
                      )}
                      <Link
                        href={p?.url ?? ""}
                        className="text-white-100 opacity-[.4] font-ppL text-xs underline"
                        target="_blank">
                        notion ↗︎
                      </Link>
                    </FlexRowStart>
                  </FlexColStartBtw>
                </FlexRowEnd>
              </FlexRowStartBtw>
            ))
                      : null}
      </FlexColStart>
    </FlexColStart>
  );
}

export default withAuth(BlogContent);
