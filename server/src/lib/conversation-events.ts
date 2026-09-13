/**
 * Inngest event helpers for background conversation summarization.
 */

import { inngest } from "../inngest/client.js";
import { summarizeConversationById } from "../services/conversation-memory.service.js";
import { sendInngestEventOrRun } from "./inngest-send.js";

/**
 * Enqueues a conversation summary job to run asynchronously via Inngest.
 *
 * Triggered every {@link CONVERSATION_SUMMARY_INTERVAL} messages during chat.
 *
 * @param input - Conversation and user ids for the summary worker
 * @returns Resolves when the event is accepted by Inngest
 *
 */
export async function enqueueConversationSummarize(input: {
    conversationId: string;
    userId: string;
}) {
    await sendInngestEventOrRun(
        () =>
            inngest.send({
                name: "conversation/summarize",
                data: input,
            }),
        () => summarizeConversationById(input.conversationId, input.userId),
        "conversation/summarize",
    );
}
