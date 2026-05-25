import { createFileRoute } from '@tanstack/react-router';
import { BlogDetailView } from '@/components/learnings/BlogDetailView';

export const Route = createFileRoute('/learnings/blogs/$blogId')({
  component: BlogDetailPage
});

function BlogDetailPage() {
  const { blogId } = Route.useParams();
  
  if (!blogId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No blog ID provided</h1>
        </div>
      </div>
    );
  }
  
  return <BlogDetailView blogId={blogId} />;
}
