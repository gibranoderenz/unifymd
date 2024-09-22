import { NextResponse } from "next/server";
import { getAgentExecutor } from "./ai";

export const POST = async (request: Request) => {
  const body = await request.json();
  const agentExecutor = await getAgentExecutor();
  if (!!agentExecutor) {
    const response = await agentExecutor.invoke({
      input: body.message,
    });
    return NextResponse.json({ message: response });
  }
};
