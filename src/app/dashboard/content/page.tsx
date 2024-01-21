"use client";
import { FlexColStart, FlexRowCenterBtw } from "@/components/flex";
import { useDataContext } from "@/context/DataContext";
import React from "react";

export default function Dashboard() {
  const { showToolBar, setActivePage } = useDataContext();

  React.useEffect(() => {
    showToolBar();
    setActivePage("content");
  }, []);
  return (
    <FlexColStart className="w-full h-full">
      <FlexRowCenterBtw className="w-full px-4 py-3">content</FlexRowCenterBtw>
    </FlexColStart>
  );
}
