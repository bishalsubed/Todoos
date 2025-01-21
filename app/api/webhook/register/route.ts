import { Webhook } from "svix";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
        return new Response("Webhook secret not set", { status: 500 });
    }
    
    const wh = new Webhook(WEBHOOK_SECRET)

    
    const headerPayload = await headers();
    
    const svixId = headerPayload.get("svix-id")
    const svixTimestamp = headerPayload.get("svix-timestamp")
    const svixSignature = headerPayload.get("svix-signature")
    
    if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response("Missing required headers", { status: 400 });
    }
    
    const payload = await request.json();
    const body = JSON.stringify(payload)
    
    let evt: WebhookEvent;
    
    try {
        evt = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature
        }) as WebhookEvent;
    } catch (error: any) {
        console.error("Error verifying webhook", error)
        return new Response("Invalid signature", { status: 400 });
    }
    
    const { id } = evt.data;
    const evtType = evt.type;
    if (evtType === "user.created") {
        try {
            const { email_addresses,primary_email_address_id } = evt.data;
            const primaryEmail = email_addresses.find((email) => email.id === primary_email_address_id)
            if(!primaryEmail){
                return new Response("Primary email not found", { status: 400 });
            }
            const newUser = await prisma.user.create({
                data: {
                    id:evt.data.id,
                    email: primaryEmail.email_address,
                    isSubscribed: false,
                }
            });
            console.log("User created", newUser)
        } catch (error) {
            return new Response("Error creating user", { status: 500 });
        }
    }

    return new Response("Webhook received", { status: 200 });

}