import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import prisma from "@/prisma/prisma";
import CatchError from "../../utils/_error";
import { NextRequest } from "next/server";

export const GET = CatchError(async (req: NextRequest) => {
  return Response.json({ message: "Clerk webhook endpoint reached" });
});

// handle clerk webhook
export const POST = CatchError(async (req: NextRequest) => {
  const wh_body = await req.json();
  const payload = JSON.stringify(wh_body);
  const headers = req.headers;

  console.log("WEBHOOK SECR", process.env.CLERK_WH_SECRET);

  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WH_SECRET as string);

  let evt: WebhookEvent;
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payload, headers as any) as WebhookEvent;
  } catch (_) {
    // If the verification fails, return a 400 error
    console.log(`❌ Invalid webhook signature`);
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }
  const data = evt.data;

  const eventType = evt.type;
  if (eventType === "user.created") {
    const {
      email_addresses,
      image_url,
      first_name,
      last_name,
      username,
      id,
      external_accounts,
    } = data as any;

    const randName = `${Math.floor(Math.random() * 1000000)}${
      first_name ?? username
    }`;
    const _username = external_accounts[0]?.username ?? randName;

    // check if user exists, if it doesn't then create a new user
    // if it does do nothing
    const email = email_addresses[0]?.email_address;
    const user = await prisma.users.findFirst({ where: { email } });

    if (!user) {
      await prisma.users.create({
        data: {
          id,
          userId: nanoid(),
          email,
          image: image_url,
          username: _username,
        },
      });

      console.log(`✅ User ${email} created!`);
      return;
    }
    console.log(`❌ User ${email} already exists. `);
  }
  if (eventType === "user.deleted") {
    const { id } = data as any;

    try {
      // delere related user data from database
      await prisma.users.delete({ where: { id } });

      console.log(`✅ User ${id} data deleted`);
    } catch (e: any) {
      console.log(`❌ Error deleting user ${id} data`);
    }
  }
});
