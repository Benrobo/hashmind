"use client";
import { FlexColStart, FlexRowCenterBtw } from "@/components/flex";
import { useDataContext } from "@/context/DataContext";
import React from "react";

export default function Dashboard() {
  const { showToolBar, setActivePage } = useDataContext();

  React.useEffect(() => {
    showToolBar();
    setActivePage("home");
  }, []);
  return (
    <FlexColStart className="w-full h-full">
      <FlexRowCenterBtw className="w-full px-4 py-3">
        <h1 className="font-ppEB text-2xl">
          Good morning,
          <br />
          <span className="">John</span>
        </h1>
        <div className="">u-image</div>
      </FlexRowCenterBtw>
    </FlexColStart>
  );
}
