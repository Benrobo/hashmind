"use client";
import React, { PropsWithChildren } from "react";

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
};

const DataContext = React.createContext<DCTypes>({} as DCTypes);

export default function DataContextProvider({ children }: PropsWithChildren) {
  const [toolbarVisible, setToolBarVisible] = React.useState<boolean>(true);
  const [activePage, setActivePage] = React.useState<ActiveToolBarPages>("");

  const showToolBar = () => setToolBarVisible(true);
  const hideToolBar = () => setToolBarVisible(false);

  const ctxVal: DCTypes = {
    toolbarVisible,
    showToolBar,
    hideToolBar,
    activePage,
    setActivePage,
  };

  return <DataContext.Provider value={ctxVal}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  return React.useContext(DataContext);
}
