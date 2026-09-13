/**
 * Inngest event helpers for background artifact generation.
 */

import { inngest } from "../inngest/client.js";
import { sendInngestEventOrRun } from "./inngest-send.js";

/**
 * Enqueues an artifact generation job to run asynchronously via Inngest.
 *
 * @param input - Artifact and workspace ids for the worker
 * @returns Resolves when the event is accepted by Inngest
 *
 */
export async function enqueueArtifactGeneration(input: {
    artifactId: string;
    workspaceId: string;
}) {
    await sendInngestEventOrRun(
        () =>
            inngest.send({
                name: "artifact/generate",
                data: input,
            }),
        () =>
            import("../services/artifact.service.js").then((mod) =>
                mod.processArtifactById(input.artifactId),
            ),
        "artifact/generate",
    );
}
