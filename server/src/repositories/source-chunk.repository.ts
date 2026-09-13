import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";

export const sourceChunkSelect = {
    id: true,
    sourceId: true,
    index: true,
    content: true,
    tokenCount: true,
    metadata: true,
    createdAt: true,
} as const;

export type SourceChunkRecord = Prisma.SourceChunkGetPayload<{
    select: typeof sourceChunkSelect;
}>;

export type CreateSourceChunkData = {
    sourceId: string;
    index: number;
    content: string;
    tokenCount?: number | null;
    metadata?: Prisma.InputJsonValue;
};

export function deleteChunksBySourceId(sourceId: string) {
    return prisma.sourceChunk.deleteMany({
        where: { sourceId },
    });
}

export async function createSourceChunks(chunks: CreateSourceChunkData[]) {
    if (chunks.length === 0) {
        return [];
    }

    const batchSize = 100;

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        await prisma.sourceChunk.createMany({
            data: batch.map((chunk) => ({
                sourceId: chunk.sourceId,
                index: chunk.index,
                content: chunk.content,
                tokenCount: chunk.tokenCount ?? null,
                ...(chunk.metadata !== undefined
                    ? { metadata: chunk.metadata }
                    : {}),
            })),
        });
    }

    return findChunksBySourceId(chunks[0]!.sourceId);
}

export function findChunksBySourceId(sourceId: string) {
    return prisma.sourceChunk.findMany({
        where: { sourceId },
        select: sourceChunkSelect,
        orderBy: { index: "asc" },
    });
}
