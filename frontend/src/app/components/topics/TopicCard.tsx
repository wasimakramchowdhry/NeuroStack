import { Link } from 'react-router';
import { NeoCard } from '../neo/NeoCard';
import { Badge } from '../ui/badge';
import { BookOpen, Clock } from 'lucide-react';
import type { Topic, Difficulty } from '../../services/topicApi';

interface TopicCardProps {
  topic: Topic;
}

const difficultyColors: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link to={`/topics/${topic.slug}`} className="block group">
      <NeoCard className="p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400">
            {topic.module}
          </Badge>
          <Badge className={`text-xs ${difficultyColors[topic.difficulty]}`}>
            {difficultyLabels[topic.difficulty]}
          </Badge>
        </div>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {topic.title}
        </h3>

        <div className="mt-auto flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>Learn</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>15-20 min</span>
          </div>
        </div>

        {/* Progress bar placeholder for Phase 6 */}
        <div className="mt-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 w-0 transition-all duration-500" />
        </div>
      </NeoCard>
    </Link>
  );
}
