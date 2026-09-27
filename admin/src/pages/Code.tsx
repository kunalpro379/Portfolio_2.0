import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, FilePlus, Folder, File, Trash2, Edit3, ChevronRight, Code2, Github, Upload } from 'lucide-react';
import config from '../config/config';
import GitHubRepoManager from '../components/GitHubRepoManager';
import GitHubRepoBrowser from '../components/GitHubRepoBrowser';

interface FolderType {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
}

interface CodeFileType {
  _id: string;
  fileId: string;
  filename: string;
  folderPath: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

interface GitHubRepo {
  _id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  isPrivate: boolean;
  createdAt: string;
}

export default function Code() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<CodeFileType[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // GitHub integration state
  const [activeTab, setActiveTab] = useState<'local' | 'github'>('local');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [showPushModal, setShowPushModal] = useState(false);
  const [selectedRepoForPush, setSelectedRepoForPush] = useState<GitHubRepo | null>(null);
  const [commitMessage, setCommitMessage] = useState('Update code from admin panel');

  useEffect(() => {
    fetchFolders();
    fetchFiles();
    fetchGithubRepos();
  }, [currentPath]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(config.api.endpoints.codeFolders(currentPath), {
        credentials: 'include'
      });
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      if (!currentPath) {
        setFiles([]);
        return;
      }
      const response = await fetch(config.api.endpoints.codeFiles(currentPath), {
        credentials: 'include'
      });
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchGithubRepos = async () => {
    try {
      const response = await fetch(config.api.endpoints.githubRepos, {
        credentials: 'include'
      });
      const data = await response.json();
      setGithubRepos(data.repos || []);
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
    }
  };

  const createFolder = async () => {
    if (!newFolderName) return;

    setLoading(true);
    try {
      const response = await fetch(config.api.endpoints.codeCreateFolder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newFolderName,
          parentPath: currentPath
        })
      });

      if (response.ok) {
        setNewFolderName('');
        setShowCreateFolderModal(false);
        fetchFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFile = async () => {
    if (!newFileName || !currentPath) return;

    setLoading(true);
    try {
      const response = await fetch(config.api.endpoints.codeCreateFile, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          filename: newFileName,
          folderPath: currentPath,
          content: '',
          language: getLanguageFromExtension(newFileName)
        })
      });

      if (response.ok) {
        setNewFileName('');
        setShowCreateFileModal(false);
        fetchFiles();
      }
    } catch (error) {
      console.error('Error creating file:', error);
    } finally {
      setLoading(false);
    }
  };

  const editFile = async (file: CodeFileType) => {
    // Navigate to dedicated editor page with fileId
    navigate(`/code/${file.fileId}`);
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const response = await fetch(config.api.endpoints.codeFileById(fileId), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder and all its contents?')) return;

    try {
      const response = await fetch(config.api.endpoints.codeFolderById(folderId), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchFolders();
        if (currentPath) {
          setCurrentPath('');
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/');
  };

  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
  };

  const pushCodeToGithub = async () => {
    if (!selectedRepoForPush || !currentPath) return;

    setLoading(true);
    try {
      const response = await fetch(config.api.endpoints.githubRepoPushCode(selectedRepoForPush._id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          folderPath: currentPath,
          commitMessage
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Successfully pushed ${data.filesCount} files to ${selectedRepoForPush.fullName}!`);
        setShowPushModal(false);
        setCommitMessage('Update code from admin panel');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error pushing to GitHub:', error);
      alert('Failed to push code to GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">Development Workspace</span>
            <h1 className="text-2xl sm:text-3xl font-display text-white mt-0.5">
              Code Editor
            </h1>
            <p className="text-sm text-white/40 mt-1">Manage local file structures, code components, and GitHub repositories.</p>
          </div>

          {/* Tab Switcher */}
          <div className="inline-flex p-1 bg-[#0d0d0d] border border-white/[0.06] rounded-none shadow-sm self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('local')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'local'
                  ? 'bg-accent text-accent-contrast shadow-sm'
                  : 'text-white/40 hover:text-white hover:bg-[#0a0a0a]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Local Files
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'github'
                  ? 'bg-accent text-accent-contrast shadow-sm'
                  : 'text-white/40 hover:text-white hover:bg-[#0a0a0a]'
              }`}
            >
              <Github className="w-4 h-4" />
              GitHub Repos
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'local' ? (
          <>
            {/* Action Toolbar & Path Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0d0d] border border-white/[0.06] rounded-none p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white text-black rounded-none text-xs font-semibold hover:bg-white/90 border border-white/20 transition shadow-sm"
                >
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </button>
                {currentPath && (
                  <button
                    onClick={() => setShowCreateFileModal(true)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-[#0a0a0a] text-white border border-white/[0.2] rounded-none text-xs font-semibold hover:bg-white/[0.05] transition shadow-sm"
                  >
                    <FilePlus className="w-4 h-4 text-accent" />
                    New File
                  </button>
                )}
                {currentPath && files.length > 0 && githubRepos.length > 0 && (
                  <button
                    onClick={() => setShowPushModal(true)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-[#0a0a0a] text-white border border-white/[0.2] rounded-none text-xs font-semibold hover:bg-white/[0.05] transition shadow-sm"
                  >
                    <Upload className="w-4 h-4 text-accent" />
                    Push to GitHub
                  </button>
                )}
              </div>

              {/* Breadcrumb Path */}
              {currentPath ? (
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <button
                    onClick={() => setCurrentPath('')}
                    className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.06] rounded-lg text-white/40 hover:text-white font-mono font-medium transition"
                  >
                    root
                  </button>
                  {getBreadcrumbs().map((part, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                      <button
                        onClick={() => {
                          const path = getBreadcrumbs().slice(0, index + 1).join('/');
                          setCurrentPath(path);
                        }}
                        className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.06] rounded-lg text-white hover:text-accent font-mono font-medium transition truncate max-w-[140px]"
                      >
                        {part}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-mono text-white/40">Path: /root</span>
              )}
            </div>

            {/* Folders & Files Layout */}
            <div className="space-y-6">
              {/* Folders Section */}
              <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-none p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-display text-white">Folders</h2>
                  <span className="text-xs font-mono text-white/40">{folders.length} items</span>
                </div>

                {folders.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/[0.06] rounded-xl bg-[#0a0a0a]/50">
                    <Folder className="w-10 h-10 text-white/40 opacity-40 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-white">No folders here</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Create a new folder to structure your files</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {folders.map((folder) => (
                      <div
                        key={folder._id}
                        onClick={() => navigateToFolder(folder.path)}
                        className="group flex items-center justify-between p-3.5 bg-[#0a0a0a] border border-white/[0.06] rounded-xl hover:border-accent/40 hover:bg-white/[0.05] transition cursor-pointer shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Folder className="w-5 h-5 text-accent flex-shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white text-xs truncate group-hover:text-accent transition">{folder.name}</h3>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFolder(folder.folderId);
                          }}
                          className="p-1.5 text-white/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Files Section */}
              {currentPath && (
                <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-none p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-display text-white">Code Files</h2>
                    <span className="text-xs font-mono text-white/40">{files.length} files</span>
                  </div>

                  {files.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-white/[0.06] rounded-xl bg-[#0a0a0a]/50">
                      <Code2 className="w-10 h-10 text-white/40 opacity-40 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-white">No code files in this folder</p>
                      <p className="text-[11px] text-white/40 mt-0.5">Create a new file to start coding</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border border border-white/[0.06] rounded-xl overflow-hidden bg-[#0a0a0a]">
                      {files.map((file) => (
                        <div
                          key={file._id}
                          className="flex items-center justify-between p-3.5 hover:bg-white/[0.05] transition gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <File className="w-4 h-4 text-white/40 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-xs font-mono truncate">{file.filename}</p>
                              <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-wider">
                                {file.language} • {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => editFile(file)}
                              className="p-1.5 text-white/40 hover:text-accent hover:bg-card border border-white/[0.06] rounded-lg transition"
                              title="Edit file"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteFile(file.fileId)}
                              className="p-1.5 text-white/40 hover:text-red-600 hover:bg-red-50 border border-white/[0.06] rounded-lg transition"
                              title="Delete file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* GitHub Tab Content */
          <div className="space-y-6">
            {selectedRepo ? (
              <GitHubRepoBrowser repo={selectedRepo} onBack={handleBackToRepos} />
            ) : (
              <GitHubRepoManager onRepoSelect={handleRepoSelect} />
            )}
          </div>
        )}

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-none p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div>
                <h3 className="text-xl font-display text-white">Create New Folder</h3>
                <p className="text-xs text-white/40 mt-1">Organize your code files into subdirectories.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">
                    Folder Name *
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="e.g. components"
                  />
                </div>

                {currentPath && (
                  <div className="p-3 bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-xs">
                    <span className="text-white/40">Target Path: </span>
                    <span className="font-mono text-white">{currentPath}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="flex-1 py-2.5 border border-white/[0.06] rounded-xl text-xs font-semibold text-white/40 hover:text-white hover:bg-[#0a0a0a] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  disabled={loading || !newFolderName}
                  className="flex-1 py-2.5 bg-white text-black rounded-none text-xs font-semibold hover:bg-white/90 border border-white/20 transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create File Modal */}
        {showCreateFileModal && (
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-none p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div>
                <h3 className="text-xl font-display text-white">Create New File</h3>
                <p className="text-xs text-white/40 mt-1">Add a new code file to the current folder.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">
                    File Name *
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="e.g. index.ts, style.css"
                  />
                </div>

                <div className="p-3 bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-xs space-y-1">
                  <div>
                    <span className="text-white/40">Folder Path: </span>
                    <span className="font-mono text-white">{currentPath}</span>
                  </div>
                  {newFileName && (
                    <div>
                      <span className="text-white/40">Detected Language: </span>
                      <span className="font-mono text-accent font-semibold">{getLanguageFromExtension(newFileName)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateFileModal(false)}
                  className="flex-1 py-2.5 border border-white/[0.06] rounded-xl text-xs font-semibold text-white/40 hover:text-white hover:bg-[#0a0a0a] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createFile}
                  disabled={loading || !newFileName}
                  className="flex-1 py-2.5 bg-white text-black rounded-none text-xs font-semibold hover:bg-white/90 border border-white/20 transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create File'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Push to GitHub Modal */}
        {showPushModal && (
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-none p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div>
                <h3 className="text-xl font-display text-white">Push Code to GitHub</h3>
                <p className="text-xs text-white/40 mt-1">Commit local files directly to your connected repository.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">
                    Select Repository *
                  </label>
                  <select
                    value={selectedRepoForPush?._id || ''}
                    onChange={(e) => {
                      const repo = githubRepos.find(r => r._id === e.target.value);
                      setSelectedRepoForPush(repo || null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    <option value="">Choose a repository...</option>
                    {githubRepos.map((repo) => (
                      <option key={repo._id} value={repo._id}>
                        {repo.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">
                    Commit Message *
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="Update code from admin panel"
                  />
                </div>

                <div className="p-3 bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-xs space-y-1">
                  <div>
                    <span className="text-white/40">Source Path: </span>
                    <span className="font-mono text-white">{currentPath}</span>
                  </div>
                  <div>
                    <span className="text-white/40">Files to push: </span>
                    <span className="font-mono text-accent font-semibold">{files.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPushModal(false)}
                  className="flex-1 py-2.5 border border-white/[0.06] rounded-xl text-xs font-semibold text-white/40 hover:text-white hover:bg-[#0a0a0a] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={pushCodeToGithub}
                  disabled={loading || !selectedRepoForPush || !commitMessage}
                  className="flex-1 py-2.5 bg-white text-black rounded-none text-xs font-semibold hover:bg-white/90 border border-white/20 transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Pushing...' : 'Push to GitHub'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}