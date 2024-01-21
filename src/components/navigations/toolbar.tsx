"use client";
import React, { useEffect } from "react";
import { FlexRowCenter } from "../flex";
import { AudioLines, BrainCog, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useLocation from "@/hooks/useLocation";
import { ActiveToolBarPages, useDataContext } from "@/context/DataContext";

const navigations = [
  {
    name: "home",
    main: false,
    path: "/dashboard/home",
  },
  {
    name: "ai",
    main: true,
    path: "/dashboard/ai",
  },
  {
    name: "settings",
    main: false,
    path: "/dashboard/settings",
  },
];

export default function ToolBar() {
  const { toolbarVisible, activePage, setActivePage } = useDataContext();
  const router = useRouter();

  return (
    <FlexRowCenter className="w-full fixed bottom-5">
      <FlexRowCenter
        className={cn(
          "min-w-[10em] bg-dark-100 px-4 py-1 rounded-full transition-all shadow-2xl drop-shadow-2xl shadow-dark-105",
          !toolbarVisible
            ? "animate-leave translate-y-[10em]"
            : "animate-enter -translate-y-[1em]"
        )}
      >
        {navigations.map((nav, i) => (
          <Link
            href={nav.path}
            onClick={() => {
              setActivePage &&
                setActivePage(nav.name.toLowerCase() as ActiveToolBarPages);
              //   router.push(nav.path);
            }}
            key={i}
            className={cn(
              "w-auto rounded-full p-2",
              nav.main
                ? "bg-blue-100 -translate-y-[1em] text-white-100"
                : activePage?.toLowerCase() === nav.name.toLowerCase() &&
                    "text-blue-100"
            )}
          >
            {renderIcon(
              nav.name.toLowerCase(),
              nav.main ? nav.name.toLowerCase() : activePage
            )}
          </Link>
        ))}
      </FlexRowCenter>
    </FlexRowCenter>
  );
}

function renderIcon(name: string, active?: string) {
  let icon: any = null;
  switch (name) {
    case "home":
      icon = (
        <Home
          size={25}
          className={cn("text-white-300", active === name && "text-white-100")}
        />
      );
      break;
    case "ai":
      icon = (
        <AudioLines
          size={25}
          className={cn("text-white-300", active === name && "text-white-100")}
        />
      );
      break;

    case "settings":
      icon = (
        <BrainCog
          size={25}
          className={cn("text-white-300", active === name && "text-white-100")}
        />
      );
      break;

    default:
      icon = null;
      break;
  }
  return icon;
}
