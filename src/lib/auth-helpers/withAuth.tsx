"use client";
import { FullPageLoader } from "@/components/loader";
import { useDataContext } from "@/context/DataContext";
import useAuthUser from "@/hooks/useAuthUser";
// import useAuthUser from "@/hooks/useAuthUser";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function withAuth<P>(Component: React.ComponentType<P>) {
  const ComponentWithAuth = (props: P & any) => {
    const { data, loading, error, refetch } = useAuthUser(false);
    const { isLoaded, userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (isLoaded) {
        const isLoggedIn = !userId;
        // Avoid infinite redirection loop
        if (isLoggedIn && pathname !== "/auth") {
          router.push("/auth");
        }
        refetch();
      }
    }, [isLoaded, userId, user, router]);

    if (loading || !userId || !user || !isLoaded) return <FullPageLoader />;

    return <Component {...props} />;
  };

  return ComponentWithAuth;
}
