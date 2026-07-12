import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CreateDocView } from '@/components/learnings/CreateDocView';
import { z } from 'zod';

const searchSchema = z.object({
  password: z.string().catch(''),
});

export const Route = createFileRoute('/learnings/docs/create')({
  validateSearch: searchSchema,
  component: CreateDocPage,
});

function CreateDocPage() {
  const { password } = Route.useSearch();
  const navigate = useNavigate();

  if (!password) {
    navigate({ to: '/learnings', search: { tab: 'docs' } });
    return null;
  }

  return <CreateDocView password={password} />;
}
