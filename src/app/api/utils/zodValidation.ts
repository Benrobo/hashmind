import { RESPONSE_CODE } from "@/types";
import { AnyZodObject } from "zod";
import HttpException from "./exception";

export default async function ZodValidation(
  schema: AnyZodObject,
  body: object,
  pathname: string
) {
  try {
    const { searchParams } = new URL(pathname);
    const query = searchParams;
    schema.parse(body ?? query);
  } catch (error: any) {
    console.log(error);
    const msg = error?.issues[0]?.message as any;
    throw new HttpException(RESPONSE_CODE.VALIDATION_ERROR, msg, 400);
  }
}
