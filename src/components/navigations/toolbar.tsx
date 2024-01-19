"use client";
import React from "react";
import { FlexRowCenter } from "../flex";
import { AudioLines, BrainCog, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [active, setActive] = React.useState<string>("home");
  const router = useRouter();

  return (
    <FlexRowCenter className="w-full fixed bottom-5">
      <FlexRowCenter className="min-w-[10em] bg-dark-100 px-4 py-1 rounded-full">
        {navigations.map((nav, i) => (
          <Link
            href={nav.path}
            key={i}
            className={cn(
              "w-auto rounded-full p-2",
              nav.main
                ? "bg-blue-100 -translate-y-[1em] text-white-100"
                : active?.toLowerCase() === nav.name.toLowerCase() &&
                    "text-blue-100"
            )}
          >
            {renderIcon(
              nav.name.toLowerCase(),
              nav.main ? nav.name.toLowerCase() : active
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
