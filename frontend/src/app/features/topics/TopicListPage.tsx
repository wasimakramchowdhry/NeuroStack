import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { topicAPI, type Difficulty } from '../../services/topicApi';
import type { Topic } from '../../services/topicApi';
import { TopicCard } from '../../components/topics/TopicCard';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton';
import { Badge } from '../../components/ui/badge';
import { Library, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

export function TopicListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string | undefined>(
    searchParams.get('module') || undefined
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | undefined>(
    (searchParams.get('difficulty') as Difficulty) || undefined
  );

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    loadTopics();
    // Update URL params
    const params = new URLSearchParams();
    if (selectedModule) params.set('module', selectedModule);
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
    setSearchParams(params);
  }, [selectedModule, selectedDifficulty, setSearchParams]);

  const loadModules = async () => {
    try {
      const moduleList = await topicAPI.getModules();
      setModules(moduleList);
    } catch (error) {
      console.error('Failed to load modules:', error);
    }
  };

  const loadTopics = async () => {
    setLoading(true);
    try {
      const response = await topicAPI.listTopics({
        module: selectedModule,
        difficulty: selectedDifficulty,
      });
      setTopics(response.topics);
    } catch (error) {
      console.error('Failed to load topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedModule(undefined);
    setSelectedDifficulty(undefined);
  };

  const hasActiveFilters = selectedModule || selectedDifficulty;

  const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
            <Library className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {t('topics.library', 'Topic Library')}
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-14">
          {t('topics.exploreCollection', 'Explore our comprehensive collection of AI & ML topics')}
        </p>
      </div>

      {/* Filters */}
      <NeoCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Filters
          </h2>
          {hasActiveFilters && (
            <NeoButton
              size="sm"
              variant="ghost"
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-orange-600 hover:text-orange-700"
            >
              <X className="w-4 h-4" />
              Clear All
            </NeoButton>
          )}
        </div>

        <div className="space-y-4">
          {/* Module Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
              Module
            </label>
            <div className="flex flex-wrap gap-2">
              {modules.map((module) => (
                <Badge
                  key={module}
                  variant={selectedModule === module ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${selectedModule === module
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  onClick={() =>
                    setSelectedModule(selectedModule === module ? undefined : module)
                  }
                >
                  {module}
                </Badge>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <Badge
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all capitalize ${selectedDifficulty === difficulty
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  onClick={() =>
                    setSelectedDifficulty(
                      selectedDifficulty === difficulty ? undefined : difficulty
                    )
                  }
                >
                  {difficulty}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </NeoCard>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-48" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <NeoCard className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            {t('topics.noTopicsFound', 'No topics found matching your filters.')}
          </p>
          {hasActiveFilters && (
            <NeoButton
              onClick={clearFilters}
              className="mt-4"
              variant="secondary"
            >
              Clear Filters
            </NeoButton>
          )}
        </NeoCard>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Showing {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}