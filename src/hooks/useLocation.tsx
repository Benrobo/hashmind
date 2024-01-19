import React from "react";

export default function useLocation() {
  const [pathname, setPathname] = React.useState<string>("");
  const [lastpath, setLastpath] = React.useState<string>("");

  React.useEffect(() => {
    const pathname = window.location.pathname;
    const lastpath = pathname.split("/").pop() || "";
    setPathname(pathname);
    setLastpath(lastpath);
  });

  return {
    pathname,
    lastpath,
  };
}
