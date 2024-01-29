"use client";
import {
  FlexColStart,
  FlexRowStart,
  FlexRowCenterBtw,
  FlexRowStartCenter,
} from "@/components/flex";
import { GPT_RESP_STYLE } from "@/data/gpt";
import { cn } from "@/lib/utils";
import { GPT_RESP_STYLE_NAME, AUTHOR_NAMES, ResponseData } from "@/types";
import { CheckCheck, ChevronRight } from "lucide-react";
import React, { useEffect } from "react";
import { StyleInfo } from "./StyleInfo";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserSettings, updateGptStyle } from "@/http/request";
import toast from "react-hot-toast";
import { FullPageLoader } from "@/components/loader";
import { Spinner } from "@/components/spinner";

type StyleChangesType = {
  name: GPT_RESP_STYLE_NAME | "";
  author_name?: AUTHOR_NAMES | "";
  isAuthor?: boolean;
};

export interface DefaultBlogStyle extends StyleChangesType {}

// an array of active dropdowns
type ActiveDDType = GPT_RESP_STYLE_NAME[];

type SettingsProps = {
  author_name: AUTHOR_NAMES;
  gpt_style: GPT_RESP_STYLE_NAME;
  is_author: boolean;
  publishing_preference: "draft" | "publish";
};

export function BlogStyleComp() {
  const [activeDD, setActiveDD] = React.useState<ActiveDDType>(
    [] as ActiveDDType
  );
  const [settings, setSettings] = React.useState<SettingsProps>();
  const [styleChanges, setStyleChanges] =
    React.useState<StyleChangesType | null>(null);
  const userSettingsQuery = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => getUserSettings(),
  });
  const [defaultBlogStyle, setDefaultBlogStyle] =
    React.useState<DefaultBlogStyle>();
  const gptStyleMutation = useMutation({
    mutationFn: async (data: any) => updateGptStyle(data),
  });

  const saveChanges = (
    name: GPT_RESP_STYLE_NAME,
    author_name?: AUTHOR_NAMES
  ) => {
    const isAuthor = name === "author_style";
    if (
      styleChanges?.name === name &&
      styleChanges?.author_name === author_name
    ) {
      setStyleChanges(null);
    } else if (styleChanges?.name === name) {
      setStyleChanges(null);
    } else {
      setStyleChanges({
        name,
        author_name: author_name ?? "",
        isAuthor,
      });
    }
  };

  const toggleDD = (name: GPT_RESP_STYLE_NAME) => {
    if ((activeDD as GPT_RESP_STYLE_NAME[]).includes(name)) {
      const newDD = activeDD?.filter((d) => d !== name);
      setActiveDD(newDD);
    } else {
      setActiveDD([...activeDD, name]);
    }
  };

  React.useEffect(() => {
    if (userSettingsQuery?.error) {
      const data = (userSettingsQuery?.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (userSettingsQuery.data) {
      const data = userSettingsQuery.data.data;
      setSettings(data);
      setDefaultBlogStyle({
        name: data.gpt_style,
        author_name: data.author_name,
        isAuthor: data.is_author,
      });
    }
  }, [
    userSettingsQuery.data,
    userSettingsQuery.error,
    userSettingsQuery.isPending,
  ]);

  React.useEffect(() => {
    if (gptStyleMutation?.error) {
      const data = (gptStyleMutation?.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (gptStyleMutation.data) {
      toast.success("Updated.");
      userSettingsQuery.refetch();
    }
  }, [
    gptStyleMutation.data,
    gptStyleMutation.error,
    gptStyleMutation.isPending,
  ]);

  const saveBlogStyle = () => {
    if (styleChanges === null) return;
    const data: Record<string, string | boolean | undefined> = {
      gpt_style: styleChanges?.name,
      is_author: styleChanges?.isAuthor,
    };
    if (styleChanges?.isAuthor) {
      data.author_name = styleChanges?.author_name;
    }

    gptStyleMutation.mutate(data);
  };

  if (userSettingsQuery.isLoading) return <FullPageLoader />;

  return (
    <FlexColStart className="w-full">
      <button
        className={cn(
          "cursor-pointer px-2 py-1 rounded-md flex items-center justify-start gap-2 scale-[.90] transition-all disabled:cursor-not-allowed ",
          styleChanges
            ? styleChanges?.name !== defaultBlogStyle?.name ||
              defaultBlogStyle?.author_name !== styleChanges?.author_name
              ? "text-white-100 bg-blue-101 "
              : "bg-dark-100 text-white-100/40"
            : "",
          gptStyleMutation.isPending ? "bg-bue-101 text-white-100" : ""
        )}
        onClick={() => {
          saveBlogStyle();
        }}
        disabled={gptStyleMutation.isPending}>
        {gptStyleMutation.isPending ? (
          <Spinner size={13} />
        ) : (
          <FlexRowStartCenter>
            <span className="text-xs">Save</span>
            <CheckCheck size={15} />
          </FlexRowStartCenter>
        )}
      </button>
      {GPT_RESP_STYLE.map((d, i) => (
        <FlexRowStart key={i} className="w-full flex-wrap">
          <FlexColStart className="w-full h-auto bg-dark-200 rounded-lg px-4 py-2 gap-0 transition-all">
            <button
              className="w-full cursor-pointer "
              data-dd={d.name}
              onClick={() => {
                toggleDD(d.name as GPT_RESP_STYLE_NAME);
              }}>
              <FlexRowCenterBtw className="w-auto " data-dd={d.name}>
                <FlexRowStartCenter>
                  <span className="text-2xl">{d.emoji}</span>
                  <span className="font-ppReg text-xs text-white-100/80 flex items-center justify-start gap-3">
                    {d.title}
                  </span>
                </FlexRowStartCenter>
                <FlexRowStartCenter>
                  {defaultBlogStyle?.name === d.name && (
                    <CheckCheck size={15} className="text-blue-101" />
                  )}
                  <ChevronRight
                    size={15}
                    className={cn(
                      "text-white-100 transition-all",
                      activeDD.includes(d.name) && "transform rotate-90"
                    )}
                  />
                </FlexRowStartCenter>
              </FlexRowCenterBtw>
            </button>

            <FlexColStart
              className={cn(
                "w-full transition-all overflow-hidden p-0 gap-0",
                activeDD.includes(d.name) ? "h-auto mt-3" : "h-[0px] mt-0"
              )}>
              {!userSettingsQuery?.isLoading && defaultBlogStyle && (
                <StyleInfo
                  style={d.name}
                  defaultBlogStyle={styleChanges ?? defaultBlogStyle}
                  saveChanges={saveChanges as any}
                  changes={styleChanges}
                />
              )}
            </FlexColStart>
          </FlexColStart>
        </FlexRowStart>
      ))}
    </FlexColStart>
  );
}
