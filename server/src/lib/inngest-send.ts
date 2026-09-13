/**
 * Send an Inngest event, or run the job in-process if the Dev Server is down.
 *
 * Local `INNGEST_DEV=1` talks to localhost:8288. Without `npx inngest-cli@latest
 * dev`, send() throws ECONNREFUSED and sources/artifacts stay PENDING forever.
 */
export async function sendInngestEventOrRun(
    send: () => Promise<unknown>,
    fallback: () => Promise<unknown>,
    label: string,
) {
    try {
        await send();
    } catch (error) {
        console.warn(
            `[inngest] ${label} send failed; running job inline`,
            error,
        );
        void Promise.resolve()
            .then(fallback)
            .catch((fallbackError) => {
                console.error(
                    `[inngest] ${label} inline job failed`,
                    fallbackError,
                );
            });
    }
}
