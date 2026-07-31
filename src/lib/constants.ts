// src/lib/constants.ts
export const ALLOWED_REACTIONS = ["👍", "❤️", "💡", "😢", "🔥", "😮"] as const;
export type AllowedReaction = typeof ALLOWED_REACTIONS[number];

export const MAX_POST_LENGTH = 5_000;
export const MAX_COMMENT_LENGTH = 1_000;

export const RATE_LIMITS = {
    POST_CREATE: { requests: 10, window: "1 m" },
    COMMENT_CREATE: { requests: 20, window: "1 m" },
    CHUNK_UNLOCK: { requests: 5, window: "1 m" },
    QUOTE_CREATE: { requests: 20, window: "1 h" },
    MAGIC_LINK: { requests: 3, window: "15 m" },
} as const;