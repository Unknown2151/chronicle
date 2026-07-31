// src/app/api/chunks/[chunkId]/posts/route.ts
import { NextResponse } from "next/server";
import {
    getChunkDiscussions,
    SpoilerGateError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError
} from "@/lib/dal";

export async function GET(
    request: Request,
    { params }: { params: { chunkId: string } }
) {
    try {
        const posts = await getChunkDiscussions(params.chunkId);
        return NextResponse.json(posts);
    } catch (error: any) {
        if (error instanceof AuthenticationError) {
            return NextResponse.json(
                { error: { code: "UNAUTHENTICATED", message: error.message, statusCode: 401 } },
                { status: 401 }
            );
        }
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { error: { code: "UNAUTHORIZED", message: error.message, statusCode: 403 } },
                { status: 403 }
            );
        }
        if (error instanceof SpoilerGateError) {
            return NextResponse.json(
                { error: { code: "SPOILER_GATE", message: error.message, statusCode: 403 } },
                { status: 403 }
            );
        }
        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { error: { code: "NOT_FOUND", message: error.message, statusCode: 404 } },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: { code: "INTERNAL_ERROR", message: "Internal Server Error", statusCode: 500 } },
            { status: 500 }
        );
    }
}