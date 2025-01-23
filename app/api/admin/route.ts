import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const Items_Per_Page = 10;

async function isAdmin(userId: string) {
    const user = (await clerkClient()).users.getUser(userId);
    return (await user).privateMetadata.role === 'admin';
}

export async function GET(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(userId)) {
        return NextResponse.json({ error: "Unauthorized - Only Admin Can Acess" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1");
    const email = searchParams.get("email");
    try {
        let user;
        if (email) {
            user = await prisma.user.findUnique({
                where: { email },
                include: {
                    todos: {
                        orderBy: { createdAt: "desc" },
                        take: Items_Per_Page,
                        skip: (page - 1) * Items_Per_Page,
                    }
                }
            })
        }
        const totalItems = email
            ? await prisma.todo.count({ where: { user: { email } } })
            : 0;
        const totalPages = Math.ceil(totalItems / Items_Per_Page);

        return NextResponse.json({ user, totalPages, currentPage: page }, { status: 200 });
    } catch (error) {
        console.error("Error fetching User Info", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(userId)) {
        return NextResponse.json({ error: "Unauthorized - Only Admin Can Acess" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get("userId");
    try {
        let user;
        let updatedUser;
        if (clientId) {
            user = await prisma.user.findUnique({
                where: { id: clientId },

            })
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 401 })
            }
            if (user.isSubscribed) {
                return NextResponse.json({ error: "User is already subscribed" }, { status: 401 })
            }
            const subscriptionEnds = new Date()
            subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)
            updatedUser = await prisma.user.update({
                where: { id: clientId },
                data: {
                    isSubscribed: true,
                    subscriptionEndsAt: subscriptionEnds
                }
            })
        }
        return NextResponse.json({ message: "Subscription Provided To the user", updatedUser, }, { status: 200 });
    } catch (error) {
        console.error("Error fetching User Info", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(userId)) {
        return NextResponse.json({ error: "Unauthorized - Only Admin Can Acess" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get("userId");
    try {
        let user;
        let updatedUser;
        if (clientId) {
            user = await prisma.user.findUnique({
                where: { id: clientId },

            })
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 401 })
            }
            if (!user.isSubscribed) {
                return NextResponse.json({ error: "User isn't subscribed" }, { status: 401 })
            }
            updatedUser = await prisma.user.update({
                where: { id: clientId },
                data: {
                    isSubscribed: false,
                    subscriptionEndsAt: null,
                }
            })
        }
        return NextResponse.json({ message: "Subscription Cancelled Of the user", updatedUser, }, { status: 200 });
    } catch (error) {
        console.error("Error fetching User Info", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


