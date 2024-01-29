"use client";
import React from "react";
import { twMerge } from "tailwind-merge";

interface BlurBgRadialProp {
  className?: React.ComponentProps<"div">["className"];
}

function BlurBgRadial({ className }: BlurBgRadialProp) {
  return (
    <div
      className={twMerge(
        `rounded-[50%] blur-[250px] w-[35%] h-[55%] opacity-70 z-[10] fixed transform bg-dark-300/[6%]`,
        className
      )}></div>
  );
}

export default BlurBgRadial;
