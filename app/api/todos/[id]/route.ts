import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const {id} =  await params;
        const todoId = id;
        const todo = await prisma.todo.findUnique({ where: { id: todoId } })
        if (!todo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }
        if (todo.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 401 });
        }
        await prisma.todo.delete({ where: { id: todoId } });
        return NextResponse.json({ message: "Todo deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting Todo", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const {id} =  await params;
        const todoId = id;
        const todo = await prisma.todo.findUnique({ where: { id: todoId } })
        if (!todo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }
        if (todo.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 401 });
        }
        const {completed } = await req.json();
        const updatedTodo = await prisma.todo.update({where: {id: todoId}, data: {completed}});
        return NextResponse.json({ message: "Todo updated successfully", updatedTodo }, { status: 200 });
    } catch (error) {
        console.error("Error updating Todo", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const {id} =  await params;
        const todoId = id;
        const todo = await prisma.todo.findUnique({ where: { id: todoId } })
        if (!todo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }
        if (todo.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 401 });
        }
        const {title } = await req.json();
        const updatedTodo = await prisma.todo.update({where: {id: todoId}, data: {title}});
        return NextResponse.json({ message: "Todo updated successfully", updatedTodo }, { status: 200 });
    } catch (error) {
        console.error("Error updating Todo", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    }
}