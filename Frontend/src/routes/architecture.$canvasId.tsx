import { createFileRoute } from "@tanstack/react-router";
import { ArchitectureDetailView } from "@/components/learnings/ArchitectureDetailView";

export const Route = createFileRoute("/architecture/$canvasId")({
  component: ArchitectureViewPage,
});

function ArchitectureViewPage() {
  const { canvasId } = Route.useParams();
  return <ArchitectureDetailView canvasId={canvasId} mode="view" />;
}
