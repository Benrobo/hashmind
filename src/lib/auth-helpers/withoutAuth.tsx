"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export const withoutAuth = <P extends { children: React.ReactNode }>(
  WrappedComponent: React.ComponentType<P>
) => {
  const Wrapper: React.FC<P> = (props) => {
    const { isLoaded, userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (isLoaded) {
        const isLoggedIn = userId;

        // Avoid infinite redirection loop
        if (isLoggedIn) {
          router.push("/dashboard/home");
        }
      }
    }, [isLoaded, userId, user, router]);

    const wrappedComponent = React.createElement(WrappedComponent, props);
    return wrappedComponent;
  };

  return Wrapper;
};
