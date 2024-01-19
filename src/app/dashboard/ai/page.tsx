"use client";
import { useDataContext } from "@/context/DataContext";
import React from "react";

export default function AI() {
  const { hideToolBar } = useDataContext();

  React.useEffect(() => {
    hideToolBar();
  }, []);

  return <div>AI</div>;
}
