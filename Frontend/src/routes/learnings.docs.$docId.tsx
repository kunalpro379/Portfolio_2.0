import { createFileRoute } from '@tanstack/react-router';
import { DocDetailView } from '@/components/learnings/DocDetailView';

export const Route = createFileRoute('/learnings/docs/$docId')({
  component: DocDetailPage
});

function DocDetailPage() {
  const { docId } = Route.useParams();
  
  if (!docId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No doc ID provided</h1>
        </div>
      </div>
    );
  }
  
  return <DocDetailView docId={docId} />;
}
