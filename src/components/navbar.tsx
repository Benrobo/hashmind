"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import {
  FlexRowCenterBtw,
  FlexRowCenter,
  FlexRowEnd,
  FlexRowStartCenter,
} from "./flex";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export const navigations = [
  {
    link: "https://github.com/benrobo/hashmind",
    visible: true,
    title: "Github",
    external: true,
  },
] as any[];

type Props = {
  scrollVisible?: boolean;
};

function HomeTopBar() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("");
  const [showSlideBar, setShowSlideBar] = React.useState(false);
  const [scrollY, setScrollY] = React.useState(0);
  const [isScrolledPast, setIsScrolledPast] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (scrollY > 30) {
      setIsScrolledPast(true);
    } else {
      setIsScrolledPast(false);
    }
  }, [scrollY]);

  //track when screen size changes
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowSlideBar(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full fixed top-0 z-[800] ">
      <FlexRowCenterBtw
        className={cn(
          "w-full h-auto py-4 px-5 bg-dark-100/30 border-b-solid border-b-[.1px] dark:border-b-white-100/20 border-b-white-400 justify-between ",
          isScrolledPast ? "backdrop-blur-md" : "backdrop-blur-md"
        )}>
        <FlexRowCenter className="w-auto md:w-full gap-5">
          <Link href={"/#home"}>
            <FlexRowCenter className="w-auto md:min-w-[100px]">
              <Image
                src={"/images/logos/hashmind.png"}
                width={30}
                height={0}
                alt="veloz logo"
              />
              <p className="text-white-100 font-ppB">Hashmind</p>
            </FlexRowCenter>
          </Link>
        </FlexRowCenter>
        <FlexRowCenter className="w-full hidden md:flex gap-5 transition-all">
          {navigations.length > 0
            ? navigations
                .filter((n) => n?.visible)
                .map((n) => (
                  <Link
                    key={n?.link}
                    href={n?.external ? n?.link : `/${n?.link}`}
                    className={cn(
                      "text-[12px] hover:text-white-100 hover:underline font-ppReg transition-all delay-700 hover:delay-700",
                      "text-white-100 font-ppB"
                    )}
                    onClick={() => setActiveTab(n?.title.toLowerCase())}>
                    {n?.title}
                  </Link>
                ))
            : null}
        </FlexRowCenter>
        <FlexRowEnd className="w-full ">
          <button
            onClick={() => {
              window.location.href = user ? "/dashboard/home" : "/auth";
            }}
            className="w-auto px-5 py-3 rounded-[30px] group bg-white-100 hover:bg-white-100/40  transition-all scale-[1] md:scale-[.90] ">
            <FlexRowStartCenter className="gap-2">
              <span className="text-dark-100 text-xs md:text-sm font-ppSB">
                {user ? "Dashboard" : "Get started"}
              </span>
              <ChevronRight
                size={15}
                className="text-dark-100 group-hover:translate-x-2 translate-x-0 transition-all"
              />
            </FlexRowStartCenter>
          </button>
        </FlexRowEnd>
      </FlexRowCenterBtw>
    </div>
  );
}

export default HomeTopBar;
