import { NextRequest, NextResponse } from "next/server";
import { handleUcpAgentCall, JsonRpcRequest } from "@/lib/ucp-agent-handler";

export async function POST(req: NextRequest) {
  try {
    const body: JsonRpcRequest = await req.json();

    const responseHeaders = {
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2026-03-26",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version, Accept"
    };

    const result = await handleUcpAgentCall(body);

    return NextResponse.json(result, {
      status: 200,
      headers: responseHeaders
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error / Invalid JSON",
          data: err.message
        }
      },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "MCP-Protocol-Version": "2026-03-26"
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version, Accept"
    }
  });
}
