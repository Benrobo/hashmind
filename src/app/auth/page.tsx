"use client";
// @ts-nocheck
import { FlexColStart, FlexColStartCenter } from "@/components/flex";
import HomeTopBar from "@/components/navbar";
import { withoutAuth } from "@/lib/auth-helpers/withoutAuth";
import { SignIn } from "@clerk/nextjs";
import React from "react";

function Auth() {
  return (
    <FlexColStartCenter className="w-full h-screen">
      <HomeTopBar />
      <FlexColStart className="w-full px-5 mt-9">
        <h1 className="text-white-100 text-2xl font-ppSB">Sign-In</h1>
      </FlexColStart>
      <SignIn />
    </FlexColStartCenter>
  );
}
export default withoutAuth(Auth);
