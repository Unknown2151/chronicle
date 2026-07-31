// src/actions/vault.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { checkRateLimit } from "@/lib/rate-limit";

// Strict Zod schema matching Section 5.3
const quoteSchema = z.object({
    bookTitle: z.string().min(1, "Book title is required"),
    chapter: z.string().optional(),
    pageNumber: z.coerce.number().optional().nullable(),
    text: z.string().min(1).max(2000, "Quote exceeds 2000 characters"),
    reflection: z.string().max(3000, "Reflection exceeds 3000 characters").optional(),
});

export async function createQuote(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Enforce Rate Limit per Section 5.2 (20 requests / 1 hour)
    await checkRateLimit(session.user.id, "QUOTE_CREATE");

    // Validate inputs with Zod
    const validatedData = quoteSchema.parse({
        bookTitle: formData.get("bookTitle"),
        chapter: formData.get("chapter"),
        pageNumber: formData.get("pageNumber") || null,
        text: formData.get("text"),
        reflection: formData.get("reflection"),
    });

    // Sanitize text and reflection to prevent XSS (Section 5.3)
    const sanitizedText = sanitizeHtml(validatedData.text);
    const sanitizedReflection = validatedData.reflection
        ? sanitizeHtml(validatedData.reflection)
        : null;

    await prisma.quote.create({
        data: {
            userId: session.user.id,
            bookTitle: validatedData.bookTitle,
            chapter: validatedData.chapter || null,
            pageNumber: validatedData.pageNumber || null,
            text: sanitizedText,
            reflection: sanitizedReflection,
            isPublic: false,
        },
    });

    revalidatePath("/vault");
}

export async function publishQuoteToDiscussion(quoteId: string, chunkId: string, roomId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Enforce Post Create Rate Limit (10 requests / 1 min) when publishing to feed
    await checkRateLimit(session.user.id, "POST_CREATE");

    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
    });

    if (!quote || quote.userId !== session.user.id) {
        throw new Error("Quote not found or unauthorized");
    }

    const postContent = `> "${quote.text}"\n\n*— ${quote.bookTitle}${quote.chapter ? `, ${quote.chapter}` : ""}${quote.pageNumber ? ` (p. ${quote.pageNumber})` : ""}${"\n\n" + (quote.reflection || "")}`;

    const post = await prisma.post.create({
        data: {
            chunkId,
            authorId: session.user.id,
            content: postContent,
            isQuote: true,
        },
    });

    await prisma.quote.update({
        where: { id: quoteId },
        data: { publishedPostId: post.id, isPublic: true },
    });

    revalidatePath(`/rooms/${roomId}/chunk/${chunkId}`);
    revalidatePath("/vault");
}