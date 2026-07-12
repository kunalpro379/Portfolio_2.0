import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { EditBlogView } from '@/components/learnings/EditBlogView';
import { z } from 'zod';

const searchSchema = z.object({
  password: z.string().catch(''),
});

export const Route = createFileRoute('/learnings/blogs/$blogId/edit')({
  validateSearch: searchSchema,
  component: EditBlogPage,
});

function EditBlogPage() {
  const { blogId } = Route.useParams();
  const { password } = Route.useSearch();
  const navigate = useNavigate();

  if (!password) {
    navigate({ to: `/learnings/blogs/${blogId}` });
    return null;
  }

  return <EditBlogView blogId={blogId} password={password} />;
}
