"use client";
import { FlexColStart, FlexRowStartBtw, FlexRowStart } from "@/components/flex";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import React from "react";

type Preference = "draft" | "publish";

function BlogPreference() {
  const [preference, setPreference] = React.useState<Preference>("draft");

  const togglePref = () =>
    setPreference(preference === "draft" ? "publish" : "draft");

  return (
    <FlexColStart className="w-full">
      <FlexRowStartBtw className="w-full">
        <FlexColStart className="leading-none gap-0">
          <h1 className="font-ppSB text-sm text-white-100">
            Blog Publishing ({preference})
          </h1>
          <span className="font-ppL text-xs text-white-300">
            Set blog publishing preference (draft or publsh)
          </span>
        </FlexColStart>
        <FlexRowStart className="w-auto">
          <button
            className={cn(
              "px-2 py-1 rounded-md font-ppL text-xs",
              preference !== "draft"
                ? "bg-blue-101 text-white-100"
                : "bg-dark-100 text-white-100/40"
            )}
          >
            save
          </button>
          <Switch
            onCheckedChange={togglePref}
            className=" data-[state=checked]:bg-blue-101"
          />
        </FlexRowStart>
      </FlexRowStartBtw>
    </FlexColStart>
  );
}

export default BlogPreference;
