import React from "react";
import { FlexColCenter, FlexRowStartCenter } from "./flex";
import { Spinner } from "./spinner";

export default function WaveLoader() {
  return (
    <div className="loading-wave">
      {Array(4)
        .fill(1)
        .map((_, i) => (
          <div className="loading-bar" key={i}></div>
        ))}
    </div>
  );
}

type Props = {
  showText?: boolean;
  text?: string;
};

export function FullPageLoader({ showText, text }: Props) {
  return (
    <FlexColCenter className="w-full min-h-screen bg-dark-100/30 z-[999] fixed top-0 left-0 backdrop-blur-lg">
      <FlexRowStartCenter className="w-auto">
        <Spinner size={20} color={"#fff"} />
        {showText && (
          <p className="text-white-100 text-[13px] font-ppReg">
            {text ?? "Loading..."}
          </p>
        )}
      </FlexRowStartCenter>
    </FlexColCenter>
  );
}

export function LineLoader() {
  return <div className="line-loader"></div>;
}
