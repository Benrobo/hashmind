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
  const svix_id = headers.get("svix-id");
  const svix_timestamp = headers.get("svix-timestamp");
  const svix_signature = headers.get("svix-signature");

  //   console.log("WEBHOOK SECR", process.env.CLERK_WH_SECRET);

  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WH_SECRET as string);

  let evt: WebhookEvent;
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payload, {
      "svix-id": svix_id as string,
      "svix-timestamp": svix_timestamp as string,
      "svix-signature": svix_signature as string,
    }) as WebhookEvent;
  } catch (e: any) {
    // If the verification fails, return a 400 error
    console.log(e);
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

    const randName = `${first_name ?? username}`;
    const _username = external_accounts[0]?.username ?? randName;

    // check if user exists, if it doesn't then create a new user
    // if it does do nothing
    const email = email_addresses[0]?.email_address;
    const user = await prisma.users.findFirst({ where: { email } });

    if (!user) {
      const userId = nanoid();
      const createUser = prisma.users.create({
        data: {
          id,
          userId,
          email,
          image: image_url,
          username: _username,
        },
      });

      const createSettings = prisma.settings.create({
        data: {
          id,
          userId,
          gpt_style: "author_style",
          default_author_name: "dan_ariely",
          publishing_preference: "draft",
        },
      });

      prisma
        .$transaction([createUser, createSettings])
        .then(() => {
          console.log(`✅ User ${email} created!`);
        })
        .catch((e) => {
          console.log(e);
          console.log(`❌ Error creating user ${email}`);
        });

      //   console.log(`✅ User ${email} created!`);
      return Response.json({ message: "User created" });
    }
    console.log(`❌ User ${email} already exists. `);
    return Response.json({ message: "User already exists" });
  }
  if (eventType === "user.deleted") {
    const { id } = data as any;

    try {
      // delere related user data from database
      await prisma.users.delete({ where: { id } });

      console.log(`✅ User ${id} data deleted`);
      return Response.json({ message: "User data deleted" });
    } catch (e: any) {
      console.log(`❌ Error deleting user ${id} data`);
      return Response.json({ message: "Error deleting user data" });
    }
  }
});
