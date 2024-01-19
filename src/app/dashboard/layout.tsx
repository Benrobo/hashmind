import ToolBar from "@components/navigations/toolbar";
import React, { PropsWithChildren } from "react";

export default function layout({ children }: PropsWithChildren) {
  return (
    <div>
      <ToolBar />
      {children}
    </div>
  );
}
