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
import { Pause, Volume2 } from "lucide-react";
import { DefaultBlogStyle } from "./BlogStyle";
import React from "react";
import { GPT_RESP_STYLE } from "@/data/gpt";

type StyleInfoProps = {
  style?: GPT_RESP_STYLE_NAME;
  //   activePlayerName: GPT_RESP_STYLE_NAME | string;
  defaultBlogStyle: DefaultBlogStyle;
  saveChanges: (
    name: GPT_RESP_STYLE_NAME,
    author_name?: AUTHOR_NAMES | ""
  ) => void;
};

export function StyleInfo({
  style,
  //   activePlayerName,
  defaultBlogStyle,
  saveChanges,
}: StyleInfoProps) {
  let comp = null;

  if (style === "author_style") {
    comp = (
      <AuthorStyle
        defaultBlogStyle={defaultBlogStyle}
        saveChanges={saveChanges}
      />
    );
  }
  if (style === "casual_conversation") {
    comp = (
      <CombineStyles
        defaultBlogStyle={defaultBlogStyle}
        saveChanges={saveChanges}
        styleName="casual_conversation"
      />
    );
  }
  if (style === "informative_and_newsy") {
    comp = (
      <CombineStyles
        defaultBlogStyle={defaultBlogStyle}
        saveChanges={saveChanges}
        styleName="informative_and_newsy"
      />
    );
  }
  if (style === "tutorials_and_guide") {
    comp = (
      <CombineStyles
        defaultBlogStyle={defaultBlogStyle}
        saveChanges={saveChanges}
        styleName="tutorials_and_guide"
      />
    );
  }

  return <>{comp}</>;
}

interface StyleProps extends StyleInfoProps {}

function AuthorStyle({ defaultBlogStyle, saveChanges }: StyleProps) {
  const [authorName, setAuthorName] =
    React.useState<AUTHOR_NAMES>("dan_ariely");
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);

  const styleAudioTest = GPT_RESP_STYLE.find(
    (s) => s.name === "author_style"
  )?.audio_responses;
  const audioUrl = styleAudioTest?.test_example;

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const audio = audioRef?.current;

  const stopAudio = () => {
    audio?.pause();
    // @ts-ignore
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const playAudio = () => {
    // @ts-ignore
    if (audio.paused && !isPlaying) audio.play();
    setIsPlaying(true);
  };

  return (
    <FlexColStart className="w-full">
      <audio src={audioUrl} controls ref={audioRef as any} className="hidden" />
      <FlexRowStartBtw className="w-full">
        <span className="text-white-100/50 text-xs font-ppReg mb-2">
          Write in these author styles:
        </span>
        <FlexRowStart className="w-auto">
          <Switch
            className=" data-[state=checked]:bg-blue-101"
            checked={defaultBlogStyle?.name === "author_style"}
            onCheckedChange={(e) => {
              saveChanges("author_style", authorName);
            }}
          />
          <button
            className={cn(
              "p-1 rounded-md bg-dark-100 border-[.2px] border-white-100/20 ",
              isPlaying ? "text-blue-101" : "text-white-100/40"
            )}
            onClick={() => {
              if (!isPlaying) playAudio();
              else stopAudio();
            }}
          >
            {isPlaying ? <Pause size={15} /> : <Volume2 size={15} />}
          </button>
        </FlexRowStart>
      </FlexRowStartBtw>
      <FlexRowStartCenter className="w-full">
        <select
          name=""
          id=""
          className="w-auto text-[10px] px-1 py-1 bg-dark-400 rounded-md font-ppReg border-none outline-none"
          onChange={(e) => {
            setAuthorName(e.target.value as AUTHOR_NAMES);
            saveChanges("author_style", e.target.value as AUTHOR_NAMES);
          }}
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
interface CombineStylePrpps extends StyleProps {
  styleName: GPT_RESP_STYLE_NAME;
}

// combine conversational, informative and tutorial style components
function CombineStyles({
  defaultBlogStyle,
  saveChanges,
  styleName,
}: CombineStylePrpps) {
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);

  const styleAudioTest = GPT_RESP_STYLE.find(
    (s) => s.name === styleName
  )?.audio_responses;
  const audioUrl = styleAudioTest?.test_example;

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const audio = audioRef?.current;

  const stopAudio = () => {
    audio?.pause();
    // @ts-ignore
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const playAudio = () => {
    // @ts-ignore
    if (audio.paused && !isPlaying) audio.play();
    setIsPlaying(true);
  };

  return (
    <FlexColStart className="w-full">
      <audio src={audioUrl} controls ref={audioRef as any} className="hidden" />
      <FlexRowStartBtw className="w-full">
        <span className="text-white-100/50 text-xs font-ppReg mb-2">
          {renderInfo(styleName)}
        </span>
        <FlexRowStart className="w-auto">
          <Switch
            className=" data-[state=checked]:bg-blue-101"
            checked={defaultBlogStyle.name === styleName}
            onCheckedChange={() => {
              saveChanges(styleName);
            }}
          />
          <button
            className={cn(
              "p-1 rounded-md bg-dark-100 border-[.2px] border-white-100/20 ",
              isPlaying ? "text-blue-101" : "text-white-100/40"
            )}
            onClick={() => {
              if (!isPlaying) playAudio();
              else stopAudio();
            }}
          >
            {isPlaying ? <Pause size={15} /> : <Volume2 size={15} />}
          </button>
        </FlexRowStart>
      </FlexRowStartBtw>
    </FlexColStart>
  );
}

function renderInfo(style: GPT_RESP_STYLE_NAME) {
  let info = null;
  if (style === "author_style") {
    info = "write in these author styles";
  }
  if (style === "casual_conversation") {
    info = "write in a casual style";
  }
  if (style === "tutorials_and_guide") {
    info =
      "Create a tutorial or guide that provides step-by-step instructions on a specific topic";
  }
  if (style === "informative_and_newsy") {
    info = "produce content that is informative";
  }
  return info;
}
