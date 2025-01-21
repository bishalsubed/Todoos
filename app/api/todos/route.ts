import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const Items_Per_Page = 10;

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const searchParams = new URLSearchParams(req.url)
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    try {
        const todos = await prisma.todo.findMany({
            where: {
                userId,
                title: {
                    contains: search,
                    mode: "insensitive"
                }
            },
            orderBy: {
                createdAt: "desc",
            },
            take: Items_Per_Page,
            skip: (page - 1) * Items_Per_Page
        })
        const totalItems = await prisma.todo.count({
            where: {
                userId,
                title: {
                    contains: search,
                    mode: "insensitive"
                }
            },
        })
        const totalPages = Math.ceil(totalItems / Items_Per_Page);
        return NextResponse.json({ todos, totalPages, currentPage: page }, { status: 200 });
    } catch (error) {
        console.error("Error fetching Todos", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    console.log(userId)
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { todos: true } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }
        if (!user.isSubscribed && user.todos.length >= 3) {
            return NextResponse.json({ error: "Upgrade your subscription to add more todos" }, { status: 403 });
        }
        const { title } = await req.json()
        const createdTodo = await prisma.todo.create({data: {title, userId}})
        return NextResponse.json(createdTodo, { status: 201 });
    } catch (error) {
        console.error("Error creating Todo", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        
    }
}
