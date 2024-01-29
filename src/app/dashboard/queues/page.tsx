"use client";
import {
  FlexColStart,
  FlexColStartCenter,
  FlexRowCenterBtw,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartCenter,
} from "@/components/flex";
import { Spinner } from "@/components/spinner";
import Button from "@/components/ui/button";
import { useDataContext } from "@/context/DataContext";
import { deleteQueue, getQueues } from "@/http/request";
import { cn } from "@/lib/utils";
import { ResponseData } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Check,
  CheckCheck,
  ChevronRight,
  Hourglass,
  MoveLeft,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { set } from "nprogress";
import React from "react";
import toast from "react-hot-toast";

type QueuesValues = {
  id: string;
  jobs: number;
  title: string;
  status: "completed" | "failed" | "pending";
  description: string;
  completed: number;
  failed: number;
  pending: number;
  subqueues: {
    id: string;
    message: string;
    status: "completed" | "failed" | "pending";
    identifier: string;
    title: string;
  }[];
};

export default function QueuesPage() {
  const { showToolBar, setActivePage } = useDataContext();
  const [dropdownVisi, setDropdownVisi] = React.useState<string>("");
  const [deletingQ, setDeletingQ] = React.useState<string>("");
  const [queues, setQueues] = React.useState<QueuesValues[]>([]);
  const getQueuesQuery = useQuery({
    queryKey: ["getQueues"],
    queryFn: async () => await getQueues(),
  });
  const deleteQueueMutation = useMutation({
    mutationFn: async (data: any) => await deleteQueue(data),
    onSuccess: () => {
      getQueuesQuery.refetch();
    },
    onError: (data: any) => {
      const error =
        (data?.response?.data as ResponseData)?.message ??
        "Something went wrong!.";
      toast.error(error);
    },
  });

  const toggleDropdownVisi = (data: string) => {
    if (data === dropdownVisi) setDropdownVisi("");
    else setDropdownVisi(data);
  };

  React.useEffect(() => {
    showToolBar();
    setActivePage("queues");

    // fetch queues every 5sec
    const intervalId = setInterval(() => {
      getQueuesQuery.refetch();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    if (getQueuesQuery?.error) {
      const data = (getQueuesQuery?.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (getQueuesQuery.data) {
      const data = getQueuesQuery.data as ResponseData;
      const queue = data.data as QueuesValues[];
      setQueues(queue);
    }
  }, [getQueuesQuery.data, getQueuesQuery.error, getQueuesQuery.isPending]);

  return (
    <FlexColStart className="w-full h-full">
      <FlexRowCenterBtw className="w-full px-4 py-3">
        <FlexColStart className="w-full py-4">
          <Link href="/dashboard/home">
            <MoveLeft
              className="text-white-100 p-2 rounded-md bg-dark-100 "
              size={30}
            />
          </Link>
          <p className="font-ppSB text-xl text-white-100">Queues</p>
          <span className="font-ppReg text-xs text-white-100/70">
            View all processing queues for your content generation.
          </span>
        </FlexColStart>
      </FlexRowCenterBtw>

      {/* Main */}
      <FlexColStart className="w-full px-4 py-2 pb-[8em]">
        {getQueuesQuery.isLoading && <Spinner />}
        {queues.length === 0 && (
          <span className="text-white-100 font-ppReg text-xs">
            No active queues
          </span>
        )}
        {!getQueuesQuery.isPending &&
          queues.map((Q, i) => (
            <FlexColStart
              key={i}
              className="w-full h-auto bg-dark-200 rounded-lg px-4 py-4 gap-0 transition-all">
              <div key={i} className="w-full">
                <FlexRowCenterBtw className="w-full">
                  <FlexColStart className="w-auto leading-none gap-0">
                    <h1 className="font-ppSB text-sm text-white-100">
                      {Q.title.length > 30
                        ? Q.title.slice(0, 30) + "..."
                        : Q.title}
                    </h1>
                  </FlexColStart>
                  <FlexRowEnd className="w-auto text-xs ">
                    {Q.subqueues.filter((q) => q.status === "pending").length >
                      0 && <Spinner size={15} />}

                    <FlexRowStart className="w-auto gap-3 ">
                      <button
                        onClick={() => {
                          setDeletingQ(Q.id);
                          deleteQueueMutation.mutate({ id: Q.id });
                        }}
                        className=""
                        disabled={deleteQueueMutation.isPending}>
                        {deleteQueueMutation.isPending && deletingQ === Q.id ? (
                          <Spinner size={12} />
                        ) : (
                          <Trash2 size={15} className="text-red-305" />
                        )}
                      </button>
                      {Q.subqueues.filter((q) => q.status === "pending")
                        .length === 0 && (
                        <span className="text-xs flex gap-1">
                          <CheckCheck size={15} className="text-green-400" />
                          <span className="text-white-100">{Q.completed}</span>
                        </span>
                      )}

                      {Q.subqueues.filter((q) => q.status === "pending")
                        .length === 0 &&
                        Q.failed > 0 && (
                          <span className="text-xs flex gap-1">
                            <ShieldAlert size={15} className="text-red-305" />
                            <span className="text-white-100">{Q.failed}</span>
                          </span>
                        )}
                    </FlexRowStart>
                    <span className="font-ppL text-white-300">
                      {Q.completed} / {Q.jobs}
                    </span>

                    <button onClick={() => toggleDropdownVisi(Q.id)}>
                      <ChevronRight
                        size={15}
                        className={cn(
                          "ml-3 text-white-100 transition-all",
                          dropdownVisi === Q.id && "transform rotate-90"
                        )}
                      />
                    </button>
                  </FlexRowEnd>
                </FlexRowCenterBtw>
              </div>

              <FlexColStart
                className={cn(
                  "w-full ml-3 transition-all gap-1",
                  dropdownVisi === Q.id ? "mt-4 h-auto" : "h-0 overflow-hidden"
                )}>
                {/* child queue content */}
                {Q.subqueues.map((subQ, i) => (
                  <QueueContent
                    key={i}
                    title={subQ.title}
                    status={subQ.status}
                    message={subQ.message}
                  />
                ))}
              </FlexColStart>
            </FlexColStart>
          ))}
      </FlexColStart>
    </FlexColStart>
  );
}

type QueueContentProps = {
  title: string;
  status: "completed" | "failed" | "pending";
  message: string;
};

function QueueContent({ title, status, message, ...rest }: QueueContentProps) {
  const [queueVisi, setQueueVisi] = React.useState<string>();
  const toggleQueueVisi = (name: string) => {
    if (status === "pending") return;
    if (name === queueVisi) setQueueVisi("");
    else setQueueVisi(name);
  };

  return (
    <FlexColStartCenter
      {...rest}
      className="w-full border-white-100/20 border-[.5px] px-2 py-2 rounded-md">
      <button
        className="w-full disabled:cursor-not-allowed"
        onClick={() => {
          toggleQueueVisi("queue_name");
        }}
        disabled={status === "pending"}>
        <FlexRowCenterBtw className="w-full">
          <FlexColStart className="w-full leading-none gap-0">
            <h1 className="font-ppReg text-xs text-white-300">{title}</h1>
          </FlexColStart>
          <FlexRowEnd className="w-full text-xs">
            {status === "pending" ? (
              <Spinner size={12} />
            ) : (
              <FlexRowCenterBtw className="w-fit">
                {status === "completed" ? (
                  <CheckCheck size={15} className="text-blue-100" />
                ) : (
                  <ShieldAlert size={15} className="text-red-305" />
                )}
              </FlexRowCenterBtw>
            )}
            <ChevronRight
              size={15}
              className={cn(
                "ml-3 transition-all",
                queueVisi === "queue_name" && "transform rotate-90",
                status === "pending" ? "text-white-400" : "text-white-100"
              )}
            />
          </FlexRowEnd>
        </FlexRowCenterBtw>
      </button>
      {queueVisi === "queue_name" && (
        <FlexColStart className={cn("w-full ml-3 transition-all")}>
          <span className="font-ppL text-xs">
            {status === "failed" ? (
              <span className="text-red-305">{message.toLowerCase()}</span>
            ) : (
              <span className="text-green-400">{message.toLowerCase()}</span>
            )}
          </span>
        </FlexColStart>
      )}
    </FlexColStartCenter>
  );
}
