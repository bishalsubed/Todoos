import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/', '/api/webhook/register', '/sign-in', '/sign-up'])

export default clerkMiddleware(async (auth, req) => {
    const { userId, redirectToSignIn } = await auth()
    if (!userId && !isPublicRoute(req)) {
        await auth.protect()
        return NextResponse.redirect(new URL("/sign-in", req.url))
    }

    if (userId) {
        try {
            const client = await clerkClient()
            const user = await client.users.getUser(userId)
            const role = user.publicMetadata.role as string | undefined
            if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
                return NextResponse.redirect(new URL("/admin/dashboard", req.url))
            }
            if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
                return NextResponse.redirect(new URL("/dashboard", req.url))
            }
            if (isPublicRoute(req)) {
                return NextResponse.redirect(new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url))
            }
        } catch (error) {
            console.error(error)
            return NextResponse.redirect(new URL("/error", req.url))
        }
    }

})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
