import { createFileRoute } from "@tanstack/react-router";
import { ArchitectureDetailView } from "@/components/learnings/ArchitectureDetailView";

export const Route = createFileRoute("/architecture/view/$viewerId")({
  component: ArchitectureViewerPage,
});

function ArchitectureViewerPage() {
  const { viewerId } = Route.useParams();
  return <ArchitectureDetailView viewerId={viewerId} mode="view" />;
}
