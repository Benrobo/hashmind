"use client";
import { useDataContext } from "@/context/DataContext";
import React from "react";

export default function Dashboard() {
  const { showToolBar } = useDataContext();

  React.useEffect(() => {
    showToolBar();
  }, []);
  return <div>Dasboard</div>;
}
