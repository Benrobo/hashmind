"use client";
import {
  FlexColStart,
  FlexRowStartBtw,
  FlexRowStart,
  FlexRowStartCenter,
} from "@/components/flex";
import { cn, getGptStyle } from "@/lib/utils";
import { AUTHOR_NAMES, GPT_RESP_STYLE_NAME } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Volume2 } from "lucide-react";
import { DefaultBlogStyle } from "./BlogStyle";
import React from "react";

type StyleInfoProps = {
  style: GPT_RESP_STYLE_NAME;
  isAudioPlaying: boolean;
  activePlayerName: GPT_RESP_STYLE_NAME | string;
  defaultBlogStyle: DefaultBlogStyle;
  //   toggleDefaultBlogStyle: (
  //     name: GPT_RESP_STYLE_NAME,
  //     author_name?: AUTHOR_NAMES | ""
  //   ) => void;
  saveChanges: (
    name: GPT_RESP_STYLE_NAME,
    author_name?: AUTHOR_NAMES | ""
  ) => void;
};

export function StyleInfo({
  style,
  isAudioPlaying,
  activePlayerName,
  defaultBlogStyle,
  //   toggleDefaultBlogStyle,
  saveChanges,
}: StyleInfoProps) {
  let comp = null;
  if (style === "author_style") {
    comp = (
      <AuthorStyle
        activePlayerName={activePlayerName}
        defaultBlogStyle={defaultBlogStyle}
        // toggleDefaultBlogStyle={toggleDefaultBlogStyle}
        saveChanges={saveChanges}
      />
    );
  }
  if (style === "casual_conversation") {
    comp = (
      <ConversationalStyle
        activePlayerName={activePlayerName}
        defaultBlogStyle={defaultBlogStyle}
        // toggleDefaultBlogStyle={toggleDefaultBlogStyle}
        saveChanges={saveChanges}
      />
    );
  }

  return comp;
}

interface StyleProps extends StyleInfoProps {}

function AuthorStyle({
  activePlayerName,
  defaultBlogStyle,
  saveChanges,
}: StyleProps) {
  const [authorName, setAuthorName] =
    React.useState<AUTHOR_NAMES>("dan_ariely");

  return (
    <FlexColStart className="w-full">
      <FlexRowStartBtw className="w-full">
        <span className="text-white-100/50 text-xs font-ppReg mb-2">
          Write in these author styles:
        </span>
        <FlexRowStart className="w-auto">
          <Switch
            className=" data-[state=checked]:bg-blue-101"
            checked={defaultBlogStyle.name === "author_style"}
            onCheckedChange={() => {
              saveChanges("author_style", authorName);
            }}
          />
          <button
            className={cn(
              "p-1 rounded-md bg-dark-100 border-[.2px] border-white-100/20 ",
              activePlayerName === "author_style"
                ? "text-blue-101"
                : "text-white-100/40"
            )}
          >
            <Volume2 size={15} />
          </button>
        </FlexRowStart>
      </FlexRowStartBtw>
      <FlexRowStartCenter className="w-full">
        <select
          name=""
          id=""
          className="w-auto text-[10px] px-1 py-1 bg-dark-400 rounded-md font-ppReg border-none outline-none"
          onChange={(e) => setAuthorName(e.target.value as AUTHOR_NAMES)}
        >
          <option value="">Select author style</option>
          {getGptStyle("author_style" as GPT_RESP_STYLE_NAME)?.styles.map(
            (a, i) => (
              <option value={a.name} key={i}>
                {a.emoji} {a.title}
              </option>
            )
          )}
        </select>

        <FlexRowStart className="w-auto">
          <span className="text-xs text-white-100/50 font-ppL">
            Default:{" "}
            <span className="font-ppReg px-2 py-1 rounded-md bg-dark-300 text-[10px] text-white-100">
              {defaultBlogStyle && defaultBlogStyle?.isAuthor
                ? getGptStyle(
                    "author_style" as GPT_RESP_STYLE_NAME
                  )?.styles.find((a) => a.name === defaultBlogStyle.author_name)
                    ?.title
                : getGptStyle(
                    "author_style" as GPT_RESP_STYLE_NAME
                  )?.styles.find((a) => a.default === true)?.title}
            </span>{" "}
          </span>
        </FlexRowStart>
      </FlexRowStartCenter>
    </FlexColStart>
  );
}

function ConversationalStyle({
  activePlayerName,
  defaultBlogStyle,
  //   toggleDefaultBlogStyle,
  saveChanges,
}: StyleProps) {
  return (
    <FlexColStart className="w-full">
      <FlexRowStartBtw className="w-full">
        <span className="text-white-100/50 text-xs font-ppReg mb-2">
          write in casual conversational style
        </span>
        <FlexRowStart className="w-auto">
          <Switch
            className=" data-[state=checked]:bg-blue-101"
            checked={defaultBlogStyle.name === "casual_conversation"}
            onCheckedChange={() => {
              //   toggleDefaultBlogStyle("casual_conversation");
              saveChanges("casual_conversation");
            }}
          />
          <button
            className={cn(
              "p-1 rounded-md bg-dark-100 border-[.2px] border-white-100/20 ",
              activePlayerName === "author_style"
                ? "text-blue-101"
                : "text-white-100/40"
            )}
          >
            <Volume2 size={15} />
          </button>
        </FlexRowStart>
      </FlexRowStartBtw>
    </FlexColStart>
  );
}
