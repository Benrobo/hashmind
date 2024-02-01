import {
  FlexColCenter,
  FlexColStart,
  FlexColStartCenter,
  FlexRowCenter,
  FlexRowCenterBtw,
} from "@/components/flex";
import { Play } from "lucide-react";
import Image from "next/image";
import React from "react";
import BlurBgRadial from "../blurBgRadial";

function Hero() {
  return (
    <FlexColCenter className="w-full h-full min-h-[600px] text-center border-b-solid border-b-[.5px] border-b-white-600/30 ">
      <div id={""} className="absolute -top-12"></div>
      <FlexColStartCenter className="relative w-full h-auto pattern-bg border-b-solid border-b-[1px] border-b-gray-100/30 ">
        <a id="home"></a>
        {/* Blur radius */}
        <BlurBgRadial className=" w-[100%] lg:w-[60%] h-[300px] absolute top-[10%] lg:top-[-10%] bg-white-300/10 " />

        <FlexColCenter className="relative w-full h-full mt-[10em] md:mt-[8em] text-center">
          <FlexRowCenter className="rainbowBorder mb-10 inline-flex items-center justify-center text-[14px] px-[2px] scale-[.90] md:scale-1 ">
            <span className="inline-flex items-center gap-1 whitespace-nowrap px-6 py-2 bg-dark-100 font-ppReg text-[12px] z-[20] text-white-100">
              Your Effortless Blogging Companion.
            </span>
          </FlexRowCenter>
          <FlexColCenter className="w-full px-2 md:max-w-[70%]">
            <h1 className=" text-4xl md:text-6xl z-[20] text-white-100 mt-2 font-ppEB">
              Hashnode Blogging Companion
            </h1>
            <p className="text-white-300 text-[12px] md:text-[14px] w-full px-6 md:0 md:max-w-[60%] font-ppReg">
              Bring your ideas to life effortlessly using Hashmind. It combines
              <span className="font-ppSB text-white-100 ml-1">Hashnode</span>,
              with powerful AI to turn your spoken words into captivating blog
              posts, complete with stunning visuals.
            </p>
            <br />
            <FlexRowCenterBtw>
              <button
                className="w-auto px-5 py-3 rounded-[30px] bg-blue-101 border-solid border-[3px] transition-all hover:scale-[1] scale-[.95] "
                //   onClick={toggleVideo}
              >
                <FlexRowCenterBtw className="w-full">
                  <Play size={20} />
                  <span className="text-white-100 font-ppSB text-[12px] ">
                    Watch Teaser
                  </span>
                </FlexRowCenterBtw>
              </button>
            </FlexRowCenterBtw>
          </FlexColCenter>
        </FlexColCenter>
        <br />
        <FlexColCenter className="w-full h-full px-8">
          <Image
            src={"/images/mockup.png"}
            width={1000}
            height={0}
            className="w-[100%] md:w-[90%] rounded-md"
            alt="hashmind mockup"
          />
        </FlexColCenter>
      </FlexColStartCenter>
    </FlexColCenter>
  );
}

export default Hero;
