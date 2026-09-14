export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trips/:path*",
    "/todos/:path*",
    "/events/:path*",
    "/expenses/:path*",
    "/documents/:path*",
    "/vault/:path*",
    "/settings/:path*",
  ],
};
