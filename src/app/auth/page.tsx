"use client";
import { FlexColStart, FlexColStartCenter } from "@/components/flex";
import { withoutAuth } from "@/lib/auth-helpers/withoutAuth";
import { SignIn } from "@clerk/nextjs";
import React from "react";

function Auth() {
  return (
    <FlexColStartCenter className="w-full h-screen">
      <FlexColStart className="w-full px-5 mt-9">
        <h1 className="text-white-100 text-2xl font-ppSB">Sign-In</h1>
      </FlexColStart>
      <SignIn />
    </FlexColStartCenter>
  );
}
export default withoutAuth(Auth);
