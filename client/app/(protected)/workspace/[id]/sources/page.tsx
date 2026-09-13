import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth";
import { SourceLibrary } from "@/features/sources";
import { getWorkspaceOrNull } from "@/features/workspaces/lib/workspace-server";
import { WorkspaceShell } from "@/features/workspaces";

type WorkspaceSourcesPageProps = {
    params: Promise<{ id: string }>;
};

export default async function WorkspaceSourcesPage({
    params,
}: WorkspaceSourcesPageProps) {
    const { id } = await params;
    const [, workspace] = await Promise.all([
        requireAuth(),
        getWorkspaceOrNull(id),
    ]);

    if (!workspace) {
        notFound();
    }

    return (
        <WorkspaceShell workspace={workspace}>
            <SourceLibrary workspaceId={workspace.id} />
        </WorkspaceShell>
    );
}
