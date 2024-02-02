import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: [
    "/api/(.*)",
    "/api/auth/notion/cb(.*)",
    "/",
    "/auth",
    "/api/webhook/(.*)",
  ],
  afterAuth: (auth, req, evt) => {
    // handle users who aren't authenticated
    // console.log(auth.isPublicRoute, req.url);
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api)(.*)"],
};
