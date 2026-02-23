import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import { topicAPI, type Topic } from '../../services/topicApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Badge } from '../../components/ui/badge';
// Removed LoadingSkeleton import
import { useAuthStore } from '../../store/authStore';
import { BookOpen, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function TopicManagerPage() {
  const { user } = useAuthStore();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const response = await topicAPI.listTopics({ limit: 100 });
      setTopics(response.topics);
    } catch (error) {
      console.error('Failed to load topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await topicAPI.deleteTopic(id);
        toast.success(`Topic "${title}" deleted successfully`);
        // Refresh the list after successful deletion
        loadTopics();
      } catch (error) {
        console.error('Failed to delete topic:', error);
        toast.error('Failed to delete topic');
      }
    }
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Topic Management
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-14">
            Create and manage learning content
          </p>
        </div>
        <Link to="/admin/topics/new">
          <NeoButton className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Topic
          </NeoButton>
        </Link>
      </div>

      {/* Topics Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <NeoCard className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No topics yet. Create your first topic to get started.
          </p>
          <Link to="/admin/topics/new">
            <NeoButton>
              <Plus className="w-4 h-4 mr-2" />
              Create First Topic
            </NeoButton>
          </Link>
        </NeoCard>
      ) : (
        <NeoCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Title
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Module
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Difficulty
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr
                    key={topic.id}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {topic.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        /{topic.slug}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400">
                        {topic.module}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={`${difficultyColors[topic.difficulty]} capitalize`}>
                        {topic.difficulty}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={topic.is_published ? 'default' : 'secondary'}>
                        {topic.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/topics/${topic.slug}`}>
                          <NeoButton size="sm" variant="ghost" title="View">
                            <Eye className="w-4 h-4" />
                          </NeoButton>
                        </Link>
                        <Link to={`/admin/topics/${topic.id}/edit`}>
                          <NeoButton size="sm" variant="ghost" title="Edit">
                            <Edit className="w-4 h-4" />
                          </NeoButton>
                        </Link>
                        <NeoButton
                          size="sm"
                          variant="ghost"
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteTopic(topic.id, topic.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </NeoButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeoCard>
      )}

      {/* Back Link */}
      <div className="mt-6">
        <Link to="/admin">
          <NeoButton variant="ghost">← Back to Admin Dashboard</NeoButton>
        </Link>
      </div>
    </div>
  );
}
