import { createFileRoute } from '@tanstack/react-router';
import { FolderFilesView } from '@/components/learnings/FolderFilesView';

export const Route = createFileRoute('/learnings/files/$folderId')({
  component: FolderFilesPage
});

function FolderFilesPage() {
  const { folderId } = Route.useParams();
  
  console.log('=== FolderFilesPage Debug ===');
  console.log('folderId:', folderId);
  
  if (!folderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No folder ID provided</h1>
          <p className="text-gray-600">folderId is: {String(folderId)}</p>
        </div>
      </div>
    );
  }
  
  return <FolderFilesView folderId={folderId} />;
}
