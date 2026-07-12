import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CreateBlogView } from '@/components/learnings/CreateBlogView';
import { z } from 'zod';

const searchSchema = z.object({
  password: z.string().catch(''),
});

export const Route = createFileRoute('/learnings/blogs/create')({
  validateSearch: searchSchema,
  component: CreateBlogPage,
});

function CreateBlogPage() {
  const { password } = Route.useSearch();
  const navigate = useNavigate();

  if (!password) {
    navigate({ to: '/learnings', search: { tab: 'blogs' } });
    return null;
  }

  return <CreateBlogView password={password} />;
}
