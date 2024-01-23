import { RESPONSE_CODE } from "@api/types";
import { NextResponse } from "next/server";

class SendResponse {
  private capitalizeWord(word: string) {
    const capWrd = word.split("")[0].toUpperCase() + word.slice(1);
    return capWrd;
  }

  error(code: RESPONSE_CODE, message: string, statusCode: number, data?: any) {
    return NextResponse.json(
      {
        errorStatus: true,
        code: RESPONSE_CODE[code],
        message: message ?? this.capitalizeWord("error-message"),
        statusCode: statusCode ?? 400,
        data,
      },
      {
        status: statusCode ?? 400,
      }
    );
  }

  success(
    code: RESPONSE_CODE,
    message: string,
    statusCode: number,
    data?: any
  ) {
    return NextResponse.json(
      {
        errorStatus: false,
        code: RESPONSE_CODE[code],
        message: message ?? this.capitalizeWord("success-message"),
        statusCode: statusCode ?? 200,
        data: data ?? null,
      },
      {
        status: statusCode ?? 200,
      }
    );
  }
}

const sendResponse = new SendResponse();
export default sendResponse;
