import { headers } from "next/headers";
import { getServerApiUrl } from "@/shared/lib/server-api";
import type { Workspace } from "./types";

async function fetchWorkspace(id: string): Promise<Workspace | null> {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie") ?? "";

    const response = await fetch(`${getServerApiUrl()}/api/workspaces/${id}`, {
        headers: { cookie },
        cache: "no-store",
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch workspace");
    }

    return response.json() as Promise<Workspace>;
}

export async function getWorkspaceOrNull(id: string) {
    return fetchWorkspace(id);
}
