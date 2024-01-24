import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "../../middlewares/auth";
import CatchError from "../../utils/_error";
import UserController from "@api/controller/user.controller";
import HttpException from "../../utils/exception";
import { RESPONSE_CODE } from "@/types";
import textToSpeech from "../../services/tts.service";
import sendResponse from "../../utils/sendResponse";

export const POST = CatchError(
  isAuthenticated(async (req: NextRequest) => {
    const payload = await req.json();
    const text = payload.text;

    if (text.length === 0 || !text) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_CONVERTING_TEXT_TO_SPEECH,
        `Text is empty`,
        400
      );
    }

    const content = await textToSpeech.googleTTS(text);
    return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200, {
      content,
    });
  })
);
