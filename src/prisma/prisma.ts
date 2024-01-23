/** @type {PrismaClient} */
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
}
// `stg` or `dev`
else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }

  prisma = (global as any).prisma as PrismaClient;
}

export default prisma;
