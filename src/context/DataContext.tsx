"use client";
import React, { PropsWithChildren } from "react";
import { UserInfo } from "@/types";

export type ActiveToolBarPages =
  | "home"
  | "ai"
  | "settings"
  | "queues"
  | "content"
  | string;

type DCTypes = {
  toolbarVisible: boolean;
  showToolBar: () => void;
  hideToolBar: () => void;
  activePage: string;
  setActivePage: (name: ActiveToolBarPages) => void;
  userInfo?: UserInfo | null;
  setUserInfo?: (userInfo: UserInfo) => void;
};

const DataContext = React.createContext<DCTypes>({} as DCTypes);

export default function DataContextProvider({ children }: PropsWithChildren) {
  const [toolbarVisible, setToolBarVisible] = React.useState<boolean>(true);
  const [activePage, setActivePage] = React.useState<ActiveToolBarPages>("");
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);

  const showToolBar = () => setToolBarVisible(true);
  const hideToolBar = () => setToolBarVisible(false);

  const ctxVal: DCTypes = {
    toolbarVisible,
    showToolBar,
    hideToolBar,
    activePage,
    setActivePage,
    userInfo,
    setUserInfo,
  };

  return <DataContext.Provider value={ctxVal}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  return React.useContext(DataContext);
}
