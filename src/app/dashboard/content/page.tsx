"use client";
import {
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowEnd,
  FlexRowStart,
} from "@/components/flex";
import { Spinner } from "@/components/spinner";
import { useDataContext } from "@/context/DataContext";
import { deleteContent, getContents } from "@/http/request";
import { ResponseData } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ExternalLink, MoveLeft, Pencil, Trash2 } from "lucide-react";
import getConfig from "next/config";
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
}

export default function BlogContent() {
  const { showToolBar, setActivePage } = useDataContext();
  const [contents, setContents] = React.useState<ContentMetadata[]>([])
  const [contDelId, setContentDelId] = React.useState("")
  const getContentsQuery = useQuery({
    queryKey: ["getContentMetadata"],
    queryFn: async ()=> await getContents()
  });
  const deleteContMutation = useMutation({
    mutationFn: async (data: any)=> await deleteContent(data),
    onSuccess: ()=> getContentsQuery.refetch(),
    onError: (data: any)=> {
      const error =
        (data?.response?.data as ResponseData)?.message ??
        "Something went wrong!.";
      toast.error(error);
      setContentDelId("")
    }
  });

  React.useEffect(() => {
    showToolBar();
    setActivePage("content");

    // fetch content every 5sec
    const intervalId = setInterval(()=> {
      getContentsQuery.refetch()
    },5000);

    return ()=> {
      clearInterval(intervalId);
    }
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
  }, [getContentsQuery.data, getContentsQuery.error, getContentsQuery.isPending]);


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
      <FlexColStart className="w-full px-4 py-2 gap-2 pb-[10em]">
        {
          getContentsQuery.isLoading && <Spinner />
        }
        {
          !getContentsQuery.isLoading &&
        contents.length > 0 ? contents.map((c, i)=>(
          <FlexRowStart key={i} className="w-full p-2 bg-dark-100 rounded-md">
            <span className="text-3xl px-4 py-3 bg-dark-300 rounded-lg">{c.emoji}</span>
            <FlexColStart className="w-full gap-0">
              <h1 className="font-ppSB text-md text-white-100">{
                c.title.length > 15 ? c.title.slice(0, 15) + "..." : c.title
              }</h1>
              <p className="font-ppReg text-xs text-white-100/70">{c.sub_heading}</p>
            </FlexColStart>
            <FlexRowEnd className="w-fit py-3 px-4">
              <a href={c.link} target="_blank" className="text-white-100">
                <ExternalLink size={15} />
              </a>
              {/* <a href={`https://hashnode.com/edit/${c.article_id}`} target="_blank" className="text-white-100">
                <Pencil size={15} />
              </a> */}
              <button className="text-red-305" onClick={()=>{
                setContentDelId(c.id);
                deleteContMutation.mutate({id: c.id});
              }}
              disabled={deleteContMutation.isPending}
              >
                {
                  contDelId === c.id ? 
                  <Spinner size={13} />
                  :
                  <Trash2 size={15} />
                }
              </button>
            </FlexRowEnd>
          </FlexRowStart>
        )):
        <span className="text-white-100 font-ppReg text-xs">
          No contents yet!.
        </span>
        }
      </FlexColStart>
    </FlexColStart>
  );
}
