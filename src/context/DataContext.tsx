"use client";
import React, { PropsWithChildren } from "react";

type DCTypes = {
  toolbarVisible: boolean;
  showToolBar: () => void;
  hideToolBar: () => void;
};

const DataContext = React.createContext<DCTypes>({} as DCTypes);

export default function DataContextProvider({ children }: PropsWithChildren) {
  const [toolbarVisible, setToolBarVisible] = React.useState<boolean>(true);

  const showToolBar = () => setToolBarVisible(true);
  const hideToolBar = () => setToolBarVisible(false);

  const ctxVal: DCTypes = {
    toolbarVisible,
    showToolBar,
    hideToolBar,
  };

  return <DataContext.Provider value={ctxVal}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  return React.useContext(DataContext);
}
