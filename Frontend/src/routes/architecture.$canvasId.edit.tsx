import { createFileRoute } from "@tanstack/react-router";
import { ArchitectureDetailView } from "@/components/learnings/ArchitectureDetailView";

export const Route = createFileRoute("/architecture/$canvasId/edit")({
  component: ArchitectureEditPage,
});

function ArchitectureEditPage() {
  const { canvasId } = Route.useParams();
  return <ArchitectureDetailView canvasId={canvasId} mode="edit" />;
}
