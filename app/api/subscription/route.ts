import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 })
        }
        const subscriptionEnds = new Date();
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);
        const updateduser = await prisma.user.update({
            where: { id: userId }, data: {
                isSubscribed: true,
                subscriptionEndsAt: subscriptionEnds
            }
        });
        return NextResponse.json({ message: "Subscription Added Successfully", subscriptionEndsAt: updateduser.subscriptionEndsAt }, { status: 200 })
    } catch (error) {
        console.error("Error updating Subscription", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
export async function GET(req: Request) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isSubscribed: true, subscriptionEndsAt: true, }
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 })
        }
        const now = new Date();
        if (user.subscriptionEndsAt && user.subscriptionEndsAt < now) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isSubscribed: false,
                    subscriptionEndsAt: null,
                }
            });
            return NextResponse.json({ isSubscribed: false,subscriptionEndsAt: null}, { status: 200 })
        }
        return NextResponse.json({ isSubscribed: user.isSubscribed,subscriptionEndsAt: user.subscriptionEndsAt}, { status: 200 })
    } catch (error) {
        console.error("Error fetching Subscription", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}