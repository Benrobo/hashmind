"use client";
// @ts-nocheck
import {
  FlexColCenter,
  FlexColStart,
  FlexColStartCenter,
} from "@/components/flex";
import HomeTopBar from "@/components/navbar";
import { withoutAuth } from "@/lib/auth-helpers/withoutAuth";
import { SignIn } from "@clerk/nextjs";
import React from "react";

function Auth() {
  return (
    <FlexColStartCenter className="w-full h-screen">
      <HomeTopBar />
      <FlexColCenter className="w-full h-full px-8 mt-[5em]">
        <FlexColStart className="p-2 scale-[.95]">
          <SignIn />
        </FlexColStart>
      </FlexColCenter>
    </FlexColStartCenter>
  );
}
export default withoutAuth(Auth);
