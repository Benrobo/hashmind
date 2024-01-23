"use client";
import { FlexColStart, FlexRowCenterBtw } from "@/components/flex";
import { useDataContext } from "@/context/DataContext";
import { UserButton } from "@clerk/nextjs";
import React from "react";

export default function Dashboard() {
  const { showToolBar, setActivePage, userInfo } = useDataContext();

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

  console.log({ userInfo });
  return (
    <FlexColStart className="w-full h-full">
      <FlexRowCenterBtw className="w-full px-4 py-3">
        <h1 className="font-ppEB text-2xl">
          Good {detectUserDay()},
          <br />
          <span className="font-ppSB">{userInfo?.username}</span>
        </h1>
        <div className="">
          <UserButton />
        </div>
      </FlexRowCenterBtw>
    </FlexColStart>
  );
}
