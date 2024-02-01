"use client";
import {
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/flex";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDataContext } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import { CheckCheck, ChevronRight, MoveLeft, ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BlogStyleComp } from "@/components/modules/settings/BlogStyle";
import BlogPreference from "@/components/modules/settings/BlogPreference";
import { useMutation, useQuery } from "@tanstack/react-query";
import { checkHnTokenIsAuthorized, updateHNToken } from "@/http/request";
import toast from "react-hot-toast";
import { ResponseData } from "@/types";
import { useSearchParams } from "next/navigation";
import env from "@/app/api/config/env";

export default function Settings() {
  const { showToolBar, setActivePage } = useDataContext();
  const params = useSearchParams();
  const [authVisi, setAuthVisi] = React.useState<boolean>(false);
  const [tokenAuthorized, setTokenAuthorized] = React.useState<boolean>(false);
  const [hnToken, setHnToken] = React.useState<string>("");
  const [hnPubId, setHnPubId] = React.useState<string>("");
  const updateHNTokenMutation = useMutation({
    mutationFn: async (data: any) => updateHNToken(data),
  });
  const checkHnAuthorizeQuery = useQuery({
    queryKey: ["checkHnAuthorize"],
    queryFn: async () => checkHnTokenIsAuthorized(),
  });

  const toggleAuthVisi = () =>
    !checkHnAuthorizeQuery.isPending && setAuthVisi(!authVisi);

  React.useEffect(() => {
    showToolBar();
    setActivePage("settings");

    if (params.get("notion")) {
      toast.success("Notion integration successful.");
    } else if (params.get("error")) {
      toast.error("Notion integration failed.");
    }
  }, []);

  React.useEffect(() => {
    if (updateHNTokenMutation?.error) {
      const data = (updateHNTokenMutation?.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (updateHNTokenMutation.data) {
      toast.success("Updated.");
    }
  }, [
    updateHNTokenMutation.data,
    updateHNTokenMutation.error,
    updateHNTokenMutation.isPending,
  ]);

  React.useEffect(() => {
    if (checkHnAuthorizeQuery?.error) {
      const data = (checkHnAuthorizeQuery?.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (checkHnAuthorizeQuery.data) {
      const { token, pubId } = (checkHnAuthorizeQuery.data as any)?.data;
      setTokenAuthorized(true);
      setHnToken(token);
      setHnPubId(pubId);
    }
  }, [
    checkHnAuthorizeQuery.data,
    checkHnAuthorizeQuery.error,
    checkHnAuthorizeQuery.isPending,
  ]);

  function updateHashnodeToken() {
    if (hnToken.length < 1) {
      toast.error("Please enter a valid token.");
      return;
    }
    updateHNTokenMutation.mutate({ token: hnToken, pubId: hnPubId });
  }

  return (
    <FlexColStart className="w-full h-screen overflow-y-scroll hideScrollBar pb-[10em]">
      <FlexColStart className="w-full px-4 py-4">
        <Link href="/dashboard/home">
          <MoveLeft
            className="text-white-100 p-2 rounded-md bg-dark-100 "
            size={30}
          />
        </Link>
        <span className="font-ppSB text-xl text-white-100">Settings</span>
      </FlexColStart>

      {/* main */}
      <FlexColStart className="w-full px-4 py-1 ">
        {/* Authrozie */}
        <FlexColStart className="w-full h-auto bg-dark-200 rounded-lg px-4 py-3 gap-0 transition-all">
          <button
            className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-[.7]"
            onClick={toggleAuthVisi}
            disabled={checkHnAuthorizeQuery.isPending}>
            <FlexRowCenterBtw className="w-full">
              <FlexRowStartCenter>
                <Image
                  src="/images/logos/hashnode.png"
                  width={30}
                  height={30}
                  alt="hashnode"
                  className="rounded-md scale-[.95] "
                />
                <span className="font-ppReg text-sm text-white-100 flex items-center justify-start gap-3">
                  Authorize Hashnode{" "}
                  {tokenAuthorized ? (
                    <CheckCheck size={15} className="text-green-400" />
                  ) : (
                    <ShieldAlert size={15} className="text-red-305" />
                  )}
                </span>
              </FlexRowStartCenter>
              <ChevronRight
                size={15}
                className={cn(
                  "text-white-100 transition-all",
                  authVisi && "transform rotate-90"
                )}
              />
            </FlexRowCenterBtw>
          </button>

          <FlexColStart
            className={cn(
              "w-full transition-all overflow-hidden p-0 gap-0",
              authVisi ? "h-auto mt-3" : "h-[0px] mt-0"
            )}>
            <span className="text-white-100/50 text-xs font-ppReg mb-2">
              Your hashnode token{" "}
              <a
                className="text-blue-101 underline"
                href="https://hashnode.com/settings/developer"
                target="_blank">
                click here
              </a>
            </span>
            <Input
              placeholder="Hashnode Token: xxxx-xx-xxxx-xxxx-xxxxxx"
              className="w-full font-ppReg text-xs bg-dark-105 text-white-100 border-dark-200/10 outline-none focus-visible:ring-0 focus-visible:border-dark-200/20"
              value={hnToken}
              onChange={(e) => setHnToken(e.target.value)}
            />
            <span className="text-white-100/50 text-xs font-ppReg mb-2 mt-1">
              Navigate to your dashboard and copy the ID from the url
            </span>
            <Input
              placeholder="Publication ID: xxxx-xx-xxxx-xxxx-xxxxxx"
              className="w-full font-ppReg text-xs bg-dark-105 text-white-100 border-dark-200/10 outline-none focus-visible:ring-0 focus-visible:border-dark-200/20"
              value={hnPubId}
              onChange={(e) => setHnPubId(e.target.value)}
            />
            <Button
              className="w-full h-[40px] mt-2 text-xs bg-blue-100 rounded-md font-ppReg disabled:cursor-not-allowed"
              onClick={updateHashnodeToken}
              isLoading={updateHNTokenMutation.isPending}
              disabled={updateHNTokenMutation.isPending}>
              Authorize
            </Button>
          </FlexColStart>
        </FlexColStart>

        {/* blog ai style */}
        <FlexColStart className="w-full mt-3">
          <FlexColStart className="leading-none gap-0">
            <h1 className="font-ppSB text-sm text-white-100">Blog Style</h1>
            <span className="font-ppL text-xs text-white-300">
              Customize how your blog is generated by hashmind.
            </span>
          </FlexColStart>

          {/* blog style settings */}
          <BlogStyleComp />

          <FlexColStart className="w-full mt-1">
            <h1 className="font-ppSB text-white-100">Integration</h1>
            <FlexRowCenterBtw className="w-full">
              <FlexColStart className="w-auto gap-0">
                <p className="text-white-100/90 text-sm font-ppSB">Notion</p>
                <p className="text-white-100/50 text-xs font-ppReg">
                  Sync Notion to Hashnode
                </p>
              </FlexColStart>
              <a
                href={
                  "https://api.notion.com/v1/oauth/authorize?client_id=ebff2951-b4d2-4785-a943-00d4cdfd9f67&response_type=code&owner=user&redirect_uri=http%3A%2F%2Flocalhost%3A2025%2Fapi%2Fauth%2Fnotion%2Fcb"
                }
                className="w-[130px] rounded-full px-3 py-2 font-ppReg text-xs bg-blue-101">
                Authorize Notion
              </a>
            </FlexRowCenterBtw>
          </FlexColStart>
        </FlexColStart>
      </FlexColStart>
    </FlexColStart>
  );
}
