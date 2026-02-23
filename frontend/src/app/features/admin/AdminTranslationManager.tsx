import { useState, useEffect } from 'react';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Globe, RefreshCw, Languages, Settings2, CheckCircle2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../store/languageStore';
import { toast } from 'sonner';
import { fetchApi } from '../../services/api';

export function AdminTranslationManager() {
    const [topics, setTopics] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({});
    const [targetLang, setTargetLang] = useState('hi'); // Default Hindi

    useEffect(() => {
        loadTopics();
    }, [targetLang]);

    const loadTopics = async () => {
        try {
            setIsLoading(true);
            const data = await fetchApi(`/topics?limit=100&lang=${targetLang}&auto_translate=false`);
            setTopics(data);
        } catch (err) {
            toast.error('Failed to load topics');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForceTranslate = async (topicId: string) => {
        try {
            setIsTranslating(prev => ({ ...prev, [topicId]: true }));
            await fetchApi(`/translations/topic/${topicId}?lang=${targetLang}`, {
                method: 'POST'
            });
            toast.success(`Translation task queued for language: ${targetLang}`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to trigger translation task');
        } finally {
            setIsTranslating(prev => ({ ...prev, [topicId]: false }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-[var(--neo-accent-orange)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--neo-text-primary)] flex items-center gap-2">
                        <Languages className="w-6 h-6 text-[var(--neo-accent-cyan)]" />
                        Translation Manager
                    </h2>
                    <p className="text-[var(--neo-text-secondary)] mt-1">
                        Force localizations of active content via Bhashini API
                    </p>
                </div>

                <NeoCard className="p-3 flex items-center gap-3">
                    <Settings2 className="w-5 h-5 text-[var(--neo-text-secondary)]" />
                    <select
                        className="bg-transparent text-[var(--neo-text-primary)] outline-none border-none cursor-pointer"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                    >
                        {SUPPORTED_LANGUAGES.map(l => (
                            <option key={l.code} value={l.code} className="bg-[var(--neo-bg-primary)]">
                                {l.name} ({l.nativeName})
                            </option>
                        ))}
                    </select>
                </NeoCard>
            </div>

            <div className="grid gap-4">
                {topics.map(topic => (
                    <NeoCard key={topic.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-medium text-[var(--neo-text-primary)]">{topic.title}</h3>
                                {topic.is_translated && (
                                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Translated
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-[var(--neo-text-secondary)] font-mono">{topic.slug}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <NeoButton
                                variant={topic.is_translated ? "ghost" : "secondary"}
                                size="sm"
                                className="w-full sm:w-auto"
                                disabled={isTranslating[topic.id]}
                                onClick={() => handleForceTranslate(topic.id)}
                            >
                                {isTranslating[topic.id] ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Globe className="w-4 h-4 mr-2" />
                                )}
                                {topic.is_translated ? 'Re-Translate' : `Translate to ${targetLang.toUpperCase()}`}
                            </NeoButton>
                        </div>
                    </NeoCard>
                ))}
            </div>
        </div>
    );
}
