"use client";
import withAuth from "@/lib/auth-helpers/withAuth";
import ToolBar from "@components/navigations/toolbar";
import React, { PropsWithChildren } from "react";

function layout({ children }: PropsWithChildren) {
  return (
    <div className="w-full">
      <ToolBar />
      {children}
    </div>
  );
}

export default withAuth(layout);
