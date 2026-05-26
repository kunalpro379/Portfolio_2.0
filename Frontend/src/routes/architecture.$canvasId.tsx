import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/architecture/$canvasId")({
  component: ArchitectureLayout,
});

function ArchitectureLayout() {
  return <Outlet />;
}
