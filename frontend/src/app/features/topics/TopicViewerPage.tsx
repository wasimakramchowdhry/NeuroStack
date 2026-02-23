import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { topicAPI, type TopicDetail, type SectionType } from '../../services/topicApi';
import { ConceptSection } from '../../components/topics/ConceptSection';
import { MathSection } from '../../components/topics/MathSection';
import { CodeSection } from '../../components/topics/CodeSection';
import { VisualSection } from '../../components/topics/VisualSection';
import { ArchitectureSection } from '../../components/topics/ArchitectureSection';
import { ImplementationSection } from '../../components/topics/ImplementationSection';
import { BenchmarkSection } from '../../components/topics/BenchmarkSection';
import { ReflectionSection } from '../../components/topics/ReflectionSection';
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton';
import { Badge } from '../../components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';
import { ChevronLeft, ChevronRight, Volume2, Loader2 } from 'lucide-react';
import { NeoButton } from '../../components/neo/NeoButton';
import { toast } from 'sonner';
import { useLanguageStore } from '../../store/languageStore';
import { fetchApi } from '../../services/api';

export function TopicViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguageStore();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      loadTopic(slug);
    }
  }, [slug, language]);

  useEffect(() => {
    // Reset audio player when topic or language changes
    setAudioUrl(null);
  }, [topic?.id, language]);

  const loadTopic = async (topicSlug: string) => {
    setLoading(true);
    try {
      const data = await topicAPI.getTopic(topicSlug);
      setTopic(data);
    } catch (error) {
      console.error('Failed to load topic:', error);
      toast.error('Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!topic) return;

    try {
      setAudioLoading(true);
      const base64Audio = await fetchApi(`/topics/${topic.id}/audio?lang=${language || 'en'}`);

      // Wrap Bhashini base64 response in a WAV Data URI
      const dataUri = `data:audio/wav;base64,${base64Audio}`;
      setAudioUrl(dataUri);
    } catch (error) {
      console.error('Failed to load audio:', error);
      toast.error('Failed to synthesize speech for this topic. Bhashini may be down.');
    } finally {
      setAudioLoading(false);
    }
  };

  const renderSection = (sectionType: SectionType, content: Record<string, unknown>, id: string) => {
    const key = id;

    switch (sectionType) {
      case 'concept':
        return <ConceptSection key={key} content={content as { markdown: string }} />;
      case 'math':
        return <MathSection key={key} content={content as { title?: string; formula: string; description?: string }} />;
      case 'code':
        return <CodeSection key={key} content={content as { language: string; title?: string; code: string }} />;
      case 'visual':
        return <VisualSection key={key} content={content as { title?: string; description?: string; placeholderText?: string }} />;
      case 'architecture':
        return <ArchitectureSection key={key} content={content as { title?: string; description?: string; imageUrl?: string; diagramType?: string }} />;
      case 'implementation':
        return <ImplementationSection key={key} content={content as { title?: string; steps: string[] }} />;
      case 'benchmark':
        return <BenchmarkSection key={key} content={content as { title?: string; data: Array<{ metric: string; value: string | number }> }} />;
      case 'reflection':
        return <ReflectionSection key={key} content={content as { question: string; hint?: string }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton className="h-12 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
          Topic Not Found
        </h1>
        <Link to="/topics">
          <NeoButton>Back to Topics</NeoButton>
        </Link>
      </div>
    );
  }

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/topics">Library</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/topics?module=${encodeURIComponent(topic.module)}`}>
                {topic.module}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{topic.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8 p-6 bg-[var(--neo-bg-secondary)] rounded-2xl neo-shadow-sm border border-[var(--neo-border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400">
              {topic.module}
            </Badge>
            <Badge className={difficultyColors[topic.difficulty]}>
              {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center">
            {!audioUrl ? (
              <NeoButton
                variant="secondary"
                size="sm"
                onClick={handlePlayAudio}
                disabled={audioLoading}
              >
                {audioLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Volume2 className="w-4 h-4 mr-2" />}
                Read Aloud
              </NeoButton>
            ) : (
              <audio src={audioUrl} controls autoPlay className="h-10 w-full sm:w-64 max-w-full" />
            )}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {topic.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Updated: {new Date(topic.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 mb-12">
        {topic.contents.map((section) =>
          renderSection(section.section_type, section.content_json, section.id)
        )}
      </div>

      {/* Quiz CTA */}
      <div className="mb-12 p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl neo-shadow border border-indigo-400/30 text-center text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-3">Test Your Knowledge</h2>
        <p className="text-indigo-100 mb-6 max-w-lg">
          Ready to verify what you've learned? Take a dynamically generated, AI-evaluated quiz on {topic.title}.
        </p>
        <Link to={`/topics/${topic.id}/quizzes`}>
          <NeoButton className="bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 shadow-xl border-none">
            View Available Quizzes
          </NeoButton>
        </Link>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-700">
        <NeoButton
          variant="secondary"
          className="flex items-center gap-2"
          disabled
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Topic
        </NeoButton>
        <Link to="/topics">
          <NeoButton variant="ghost">
            Back to Library
          </NeoButton>
        </Link>
        <NeoButton
          variant="secondary"
          className="flex items-center gap-2"
          disabled
        >
          Next Topic
          <ChevronRight className="w-4 h-4" />
        </NeoButton>
      </div>
    </div>
  );
}
