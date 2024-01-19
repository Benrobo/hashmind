"use client";
import { useDataContext } from "@/context/DataContext";
import React from "react";

export default function Settings() {
  const { showToolBar } = useDataContext();

  React.useEffect(() => {
    showToolBar();
  }, []);
  return <div>Settings</div>;
}
