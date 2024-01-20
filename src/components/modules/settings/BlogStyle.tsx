"use client";
import {
  FlexColStart,
  FlexRowStart,
  FlexRowCenterBtw,
  FlexRowStartCenter,
} from "@/components/flex";
import { GPT_RESP_STYLE } from "@/data/gpt";
import { cn } from "@/lib/utils";
import { GPT_RESP_STYLE_NAME, AUTHOR_NAMES } from "@/types";
import { CheckCheck, ChevronRight } from "lucide-react";
import React, { useEffect } from "react";
import { StyleInfo } from "./StyleInfo";

type StyleChangesType = {
  name: GPT_RESP_STYLE_NAME | "";
  author_name?: AUTHOR_NAMES | "";
  isAuthor?: boolean;
};

export interface DefaultBlogStyle extends StyleChangesType {}

// an array of active dropdowns
type ActiveDDType = GPT_RESP_STYLE_NAME[];

export function BlogStyleComp() {
  // DD => Dropdown
  const [isAuthorStyle, setIsAuthorStyle] = React.useState<boolean>(false);

  const [activeDD, setActiveDD] = React.useState<ActiveDDType>(
    [] as ActiveDDType
  );

  const [styleChanges, setStyleChanges] =
    React.useState<StyleChangesType | null>(null);

  const [defaultBlogStyle, setDefaultBlogStyle] =
    React.useState<DefaultBlogStyle>({
      name: "author_style",
      author_name: "dan_ariely",
      isAuthor: true,
    });

  const toggleDefaultBlogStyle = (
    name: GPT_RESP_STYLE_NAME,
    author_name?: AUTHOR_NAMES | "dan_ariely"
  ) => {
    const isAuthor = name === "author_style";
    if (defaultBlogStyle.name === name) {
      setDefaultBlogStyle({
        name: "",
        author_name: "",
        isAuthor: false,
      });
    } else {
      setDefaultBlogStyle({
        name,
        author_name,
        isAuthor,
      });
    }
  };

  const saveChanges = (
    name: GPT_RESP_STYLE_NAME,
    author_name?: AUTHOR_NAMES
  ) => {
    const isAuthor = name === "author_style";
    if (styleChanges?.name === name) {
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

  const saveBlogStyle = () => {
    console.log(styleChanges);
  };

  return (
    <FlexColStart className="w-full">
      <button
        className={cn(
          "cursor-pointer px-2 py-1 rounded-md flex items-center justify-start gap-2 scale-[.90] transition-all ",
          styleChanges && styleChanges?.name !== defaultBlogStyle.name
            ? "text-white-100 bg-blue-101 "
            : "bg-dark-100 text-white-100/40"
        )}
        onClick={() => {
          saveBlogStyle();
        }}
      >
        <span className="text-xs">Save</span>
        <CheckCheck size={15} />
      </button>
      {GPT_RESP_STYLE.map((d, i) => (
        <FlexRowStart key={i} className="w-full flex-wrap">
          <FlexColStart className="w-full h-auto bg-dark-200 rounded-lg px-4 py-2 gap-0 transition-all">
            <button
              className="w-full cursor-pointer "
              data-dd={d.name}
              onClick={() => {
                toggleDD(d.name as GPT_RESP_STYLE_NAME);
              }}
            >
              <FlexRowCenterBtw className="w-auto " data-dd={d.name}>
                <FlexRowStartCenter>
                  <span className="text-2xl">{d.emoji}</span>
                  <span className="font-ppReg text-xs text-white-100/80 flex items-center justify-start gap-3">
                    {d.title}
                  </span>
                </FlexRowStartCenter>
                <FlexRowStartCenter>
                  {defaultBlogStyle.name === d.name && (
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
              )}
            >
              <StyleInfo
                style={d.name}
                defaultBlogStyle={styleChanges ?? defaultBlogStyle}
                saveChanges={saveChanges as any}
              />
            </FlexColStart>
          </FlexColStart>
        </FlexRowStart>
      ))}
    </FlexColStart>
  );
}
