import { RESPONSE_CODE } from "@api/types";
import HttpException from "./exception";
import sendResponse from "./sendResponse";

export default function CatchError(fn: Function) {
  return async function (req: Request) {
    try {
      return await fn(req);
    } catch (err: any) {
      const code = RESPONSE_CODE[err.code as any];
      console.log(`😥 Error [${code}]: ${err?.message}`);
      console.log(err);
      if (err instanceof HttpException) {
        return sendResponse.error(err.code, err.message, err.statusCode, err);
      }

      return sendResponse.error(
        RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        "INTERNAL SERVER ERROR",
        500,
        err
      );
    }
  };
}
