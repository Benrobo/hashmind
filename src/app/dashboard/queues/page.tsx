"use client";
import {
  FlexColStart,
  FlexColStartCenter,
  FlexRowCenterBtw,
  FlexRowEnd,
} from "@/components/flex";
import { Spinner } from "@/components/spinner";
import { useDataContext } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCheck,
  ChevronRight,
  Hourglass,
  MoveLeft,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Dashboard() {
  const { showToolBar, setActivePage } = useDataContext();
  const [dropdownVisi, setDropdownVisi] = React.useState<boolean>(false);

  const toggleDropdownVisi = () => setDropdownVisi(!dropdownVisi);

  React.useEffect(() => {
    showToolBar();
    setActivePage("queues");
  }, []);
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
      <FlexColStart className="w-full px-4 py-2">
        <FlexColStart className="w-full h-auto bg-dark-200 rounded-lg px-4 py-4 gap-0 transition-all">
          <button className="w-full" onClick={toggleDropdownVisi}>
            <FlexRowCenterBtw className="w-full">
              <FlexColStart className="w-full leading-none gap-0">
                <h1 className="font-ppSB text-sm text-white-100">
                  Queues Title
                </h1>
              </FlexColStart>
              <FlexRowEnd className="w-full text-xs">
                {false ? (
                  <Spinner size={15} />
                ) : (
                  <FlexRowCenterBtw className="w-fit">
                    <span className="text-xs flex gap-1">
                      <CheckCheck size={15} className="text-green-400" />
                      <span className="text-white-100">3</span>
                    </span>

                    <span className="text-xs flex gap-1">
                      <ShieldAlert size={15} className="text-red-305" />
                      <span className="text-white-100">1</span>
                    </span>
                  </FlexRowCenterBtw>
                )}
                <span className="font-ppL text-white-300">1 / 4</span>
                <ChevronRight
                  size={15}
                  className={cn(
                    "ml-3 text-white-100 transition-all",
                    dropdownVisi && "transform rotate-90"
                  )}
                />
              </FlexRowEnd>
            </FlexRowCenterBtw>
          </button>

          <FlexColStart
            className={cn(
              "w-full ml-3 transition-all gap-1",
              dropdownVisi ? "mt-4 h-auto" : "h-0 overflow-hidden"
            )}
          >
            {/* child queue content */}
            <QueueVContent
              title="Processing cover image"
              status="completed"
              message="Cover image generated successfully."
            />
            <QueueVContent
              title="Processing blog images"
              status="pending"
              message="error processing blog images."
            />
          </FlexColStart>
        </FlexColStart>
      </FlexColStart>
    </FlexColStart>
  );
}

type QueueContentProps = {
  title: string;
  status: "completed" | "failed" | "pending";
  message: string;
};

function QueueVContent({ title, status, message }: QueueContentProps) {
  const [queueVisi, setQueueVisi] = React.useState<string>("queue_name");
  const toggleQueueVisi = (name: string) => {
    if (status === "pending") return;
    if (name === queueVisi) setQueueVisi("");
    else setQueueVisi(name);
  };

  return (
    <FlexColStartCenter className="w-full border-white-100/20 border-[.5px] px-2 py-2 rounded-md">
      <button
        className="w-full disabled:cursor-not-allowed"
        onClick={() => {
          toggleQueueVisi("queue_name");
        }}
        disabled={status === "pending"}
      >
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
