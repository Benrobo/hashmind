"use client";
import React from "react";
import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "../flex";
import { Bird, Box, Crown, Flame, ScrollText } from "lucide-react";
import Image from "next/image";

type OverviewKey =
  | "content-generation"
  | "voice-activated"
  | "notion-integration";
type OverviewData = {
  title: string;
  desc: string;
  key: OverviewKey;
};

const overviewData = [
  {
    title: "Content Generation Wizardry",
    desc: "Hashmind harnesses the power of GPT to effortlessly generate high-quality content for your articles, blog posts, and more in preferred style.",
    key: "content-generation",
  },
  {
    title: "Voice-Activated Writing",
    desc: "With Hashmind's voice-activated interface, you can dictate your thoughts, ideas, and content, allowing for a hands-free and intuitive writing experience.",
    key: "voice-activated",
  },
  {
    title: "Notion Integration",
    desc: "Hashmind allows users to synchronize their Notion pages, enabling a seamless transition from Notion to Hashnode. Easily post your articles from Notion to Hashnode with just a few clicks.",
    key: "notion-integration",
  },
] as OverviewData[];

function Overview() {
  return (
    <FlexColStart className="relative w-full h-auto bg-dark-105 border-t-solid border-t-[1px] border-t-gray-100/30 px-4 md:px-9 py-[6em]">
      <FlexColCenter className="w-full md:max-w-[95%] xl:max-w-[85%] mx-auto">
        <div className="w-full h-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:px-5">
          <FlexColStart className="w-full h-auto">
            <FlexRowStartCenter className="w-auto">
              <Flame
                size={50}
                className="p-3 bg-red-305 text-white-100 rounded-lg"
              />
              <h1 className="text-white-100 font-ppSB">
                Get Started in minutes.
              </h1>
            </FlexRowStartCenter>
            <p className="text-white-300/40 font-ppSB text-2xl md:text-4xl">
              <span className="text-white-100">Write with Confidence</span>.
              Hashmind, your ultimate content creation companion, is packed with
              cutting-edge features to make your writing journey smooth and
              enjoyable.
            </p>
          </FlexColStart>
          <FlexColCenter className="w-full">
            <Image
              src="/images/usecase.png"
              alt="overview"
              className="w-full h-auto rounded-lg shadow-xl shadow-dark-105"
              width={600}
              height={0}
            />
          </FlexColCenter>
        </div>
        <FlexRowStartBtw className="w-full h-auto mt-20 grid grid-cols-1 md:grid-cols-3 ">
          {overviewData.map((data, i) => (
            <OverviewCard
              title={data.title}
              description={data.desc}
              key={i}
              _key={data.key}
            />
          ))}
        </FlexRowStartBtw>
      </FlexColCenter>
    </FlexColStart>
  );
}

export default Overview;

type OverviewCardProps = {
  title: string;
  description: string;
  _key: OverviewKey;
};

function OverviewCard({ title, _key, description }: OverviewCardProps) {
  return (
    <FlexRowStart className="w-auto h-auto px-4 py-3 rounded-lg bg-dark-200 border-solid border-[1px] border-gray-100/40 ">
      {renderIcon(_key)}
      <FlexColStart className="w-full">
        <h1 className="text-white-100 font-ppSB text-md">{title}</h1>
        <p className="text-white-300/40 font-ppReg text-xs">{description}</p>
      </FlexColStart>
    </FlexRowStart>
  );
}

function renderIcon(key: OverviewKey) {
  let icon = null;
  switch (key) {
    case "content-generation":
      icon = (
        <Box
          size="40"
          className="text-orange-100 p-[8px] bg-orange-200 rounded-md "
          // variant="Broken"
        />
      );
      break;
    case "notion-integration":
      icon = (
        <ScrollText
          size="40"
          className="text-blue-100 p-[8px] bg-blue-200 rounded-md "
        />
      );
      break;

    case "voice-activated":
      icon = (
        <Crown
          size="40"
          className="text-teal-100 p-[8px] bg-teal-200 rounded-md "
        />
      );
      break;
    default:
      icon = null;
      break;
  }
  return icon;
}
