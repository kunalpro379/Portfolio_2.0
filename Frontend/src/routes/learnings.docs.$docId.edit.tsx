import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { EditDocView } from '@/components/learnings/EditDocView';
import { z } from 'zod';

const searchSchema = z.object({
  password: z.string().catch(''),
});

export const Route = createFileRoute('/learnings/docs/$docId/edit')({
  validateSearch: searchSchema,
  component: EditDocPage,
});

function EditDocPage() {
  const { docId } = Route.useParams();
  const { password } = Route.useSearch();
  const navigate = useNavigate();

  if (!password) {
    navigate({ to: `/learnings/docs/${docId}` });
    return null;
  }

  return <EditDocView docId={docId} password={password} />;
}
