"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export function withoutAuth<P>(Component: React.ComponentType<P>) {
  const ComponentWithAuth = (props: P & any) => {
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

    return <Component {...props} />;
  };

  return ComponentWithAuth;
}
