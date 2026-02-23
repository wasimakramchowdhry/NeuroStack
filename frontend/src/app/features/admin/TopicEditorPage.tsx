import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { topicAPI, type TopicCreate, type TopicContentCreate, type SectionType, type TopicDetail } from '../../services/topicApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Plus, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton';

const SECTION_OPTIONS: { value: SectionType; label: string }[] = [
    { value: 'concept', label: 'Markdown Concept' },
    { value: 'math', label: 'LaTeX Math Formula' },
    { value: 'code', label: 'Code Block' },
    { value: 'visual', label: 'Animation Placeholder' },
];

export function TopicEditorPage() {
    const { id } = useParams<{ id?: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    // Topic Metadata State
    const [topicId, setTopicId] = useState<string | null>(id || null);
    const [formData, setFormData] = useState<TopicCreate>({
        title: '',
        slug: '',
        module: 'Fundamentals',
        difficulty: 'beginner',
        order: 1,
        is_published: false,
    });

    // Topic Contents State
    const [contents, setContents] = useState<TopicContentCreate[]>([]);

    useEffect(() => {
        if (isEditMode && id) {
            loadTopicData(id);
        }
    }, [id, isEditMode]);

    const loadTopicData = async (topicIdToLoad: string) => {
        try {
            // Find the topic slug first to load details (Current API limitation, ideally we should have getById)
            // For now we assume we load from the list to get the slug. This is a bit hacky but works for now.
            const list = await topicAPI.listTopics({ limit: 100 });
            const targetTopic = list.topics.find(t => t.id === topicIdToLoad);

            if (!targetTopic) throw new Error("Topic not found");

            const detail: TopicDetail = await topicAPI.getTopic(targetTopic.slug);

            setFormData({
                title: detail.title,
                slug: detail.slug,
                module: detail.module,
                difficulty: detail.difficulty,
                order: detail.order,
                is_published: detail.is_published,
            });

            setContents(detail.contents.map(c => ({
                section_type: c.section_type,
                content_json: c.content_json,
                order: c.order
            })));

        } catch (error) {
            console.error(error);
            toast.error('Failed to load topic details');
            navigate('/admin/topics');
        } finally {
            setLoading(false);
        }
    };

    const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: TopicCreate) => ({ ...prev, [name]: value }));
    };

    const addSection = (type: SectionType) => {
        let defaultJson = {};
        if (type === 'concept') defaultJson = { markdown: '' };
        if (type === 'math') defaultJson = { formula: '', description: '' };
        if (type === 'code') defaultJson = { language: 'python', code: '' };
        if (type === 'visual') defaultJson = { animation_id: '', fallback_image: '' };

        setContents((prev: TopicContentCreate[]) => [
            ...prev,
            { section_type: type, content_json: defaultJson, order: prev.length + 1 }
        ]);
    };

    const updateSectionJson = (index: number, key: string, value: any) => {
        setContents((prev: TopicContentCreate[]) => {
            const newContents = [...prev];
            newContents[index].content_json = {
                ...newContents[index].content_json,
                [key]: value
            };
            return newContents;
        });
    };

    const removeSection = (index: number) => {
        setContents((prev: TopicContentCreate[]) => prev.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i + 1 })));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === contents.length - 1)) return;

        setContents((prev: TopicContentCreate[]) => {
            const newContents = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;

            // Swap items
            const temp = newContents[index];
            newContents[index] = newContents[targetIndex];
            newContents[targetIndex] = temp;

            // Update orders
            return newContents.map((c, i) => ({ ...c, order: i + 1 }));
        });
    };

    const handleSave = async () => {
        if (!formData.title || !formData.slug || !formData.module) {
            toast.error('Please fill in all required metadata (Title, Slug, Module)');
            return;
        }

        setSaving(true);
        try {
            let savedTopicId = topicId;

            if (isEditMode && savedTopicId) {
                // Update existing
                await topicAPI.updateTopic(savedTopicId, formData);
                await topicAPI.updateTopicContents(savedTopicId, contents);
                toast.success('Topic updated successfully');
            } else {
                // Create new
                const newTopic = await topicAPI.createTopic(formData);
                savedTopicId = newTopic.id;
                setTopicId(savedTopicId);

                // Ensure contents array has no empty strings that break postgres JSON validator
                if (contents.length > 0) {
                    await topicAPI.updateTopicContents(savedTopicId, contents);
                }

                toast.success('Topic created successfully');
                navigate(`/admin/topics/${savedTopicId}/edit`, { replace: true });
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || 'Failed to save topic');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
                <div className="h-10 w-32 mb-8 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-48 w-full animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-96 w-full animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl pb-32">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <NeoButton variant="ghost" size="sm" onClick={() => navigate('/admin/topics')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </NeoButton>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        {isEditMode ? 'Edit Topic' : 'Create New Topic'}
                    </h1>
                </div>
                <NeoButton onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Topic'}
                </NeoButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <NeoCard className="p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-800 dark:text-slate-100">
                            Content Blocks
                        </h2>

                        {contents.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                <p className="text-slate-500 mb-4">No content blocks yet.</p>
                                <p className="text-sm text-slate-400">Add a block using the sidebar.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {contents.map((section, index) => (
                                    <NeoCard key={index} className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold">
                                                    #{index + 1}
                                                </span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200 uppercase text-sm">
                                                    {section.section_type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <NeoButton size="sm" variant="ghost" onClick={() => moveSection(index, 'up')} disabled={index === 0}>
                                                    <ArrowUp className="w-4 h-4" />
                                                </NeoButton>
                                                <NeoButton size="sm" variant="ghost" onClick={() => moveSection(index, 'down')} disabled={index === contents.length - 1}>
                                                    <ArrowDown className="w-4 h-4" />
                                                </NeoButton>
                                                <NeoButton size="sm" variant="ghost" onClick={() => removeSection(index)} className="text-red-500 hover:text-red-600 ml-2">
                                                    <Trash2 className="w-4 h-4" />
                                                </NeoButton>
                                            </div>
                                        </div>

                                        {/* Section Editor Fields based on Type */}
                                        <div className="space-y-4">
                                            {section.section_type === 'concept' && (
                                                <div>
                                                    <Label>Markdown Content</Label>
                                                    <textarea
                                                        className="w-full mt-1 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 min-h-[150px] font-mono text-sm"
                                                        value={section.content_json.markdown || ''}
                                                        onChange={(e) => updateSectionJson(index, 'markdown', e.target.value)}
                                                        placeholder="# Heading&#10;Write your concept here..."
                                                    />
                                                </div>
                                            )}

                                            {section.section_type === 'math' && (
                                                <>
                                                    <div>
                                                        <Label>LaTeX Formula</Label>
                                                        <input
                                                            className="w-full mt-1 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-sm"
                                                            value={section.content_json.formula || ''}
                                                            onChange={(e) => updateSectionJson(index, 'formula', e.target.value)}
                                                            placeholder="e.g. \sum_{i=1}^n A_i B_i"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Description (Optional)</Label>
                                                        <input
                                                            className="w-full mt-1 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                                                            value={section.content_json.description || ''}
                                                            onChange={(e) => updateSectionJson(index, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {section.section_type === 'code' && (
                                                <>
                                                    <div className="flex gap-4">
                                                        <div className="w-1/3">
                                                            <Label>Language</Label>
                                                            <input
                                                                className="w-full mt-1 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                                                                value={section.content_json.language || 'python'}
                                                                onChange={(e) => updateSectionJson(index, 'language', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Code</Label>
                                                        <textarea
                                                            className="w-full mt-1 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 min-h-[200px] font-mono text-sm"
                                                            value={section.content_json.code || ''}
                                                            onChange={(e) => updateSectionJson(index, 'code', e.target.value)}
                                                            placeholder="def hello_world():&#10;    print('Hello')"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {section.section_type === 'visual' && (
                                                <div className="text-center py-6 text-sm text-slate-500 italic">
                                                    Visual placeholder block. Animation implementation arriving in Phase 5.
                                                </div>
                                            )}
                                        </div>
                                    </NeoCard>
                                ))}
                            </div>
                        )}
                    </NeoCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <NeoCard className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Metadata</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <input
                                    id="title"
                                    name="title"
                                    required
                                    className="w-full mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                                    value={formData.title}
                                    onChange={handleMetadataChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="slug">URL Slug *</Label>
                                <input
                                    id="slug"
                                    name="slug"
                                    required
                                    className="w-full mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-sm"
                                    value={formData.slug}
                                    onChange={handleMetadataChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="module">Module *</Label>
                                <input
                                    id="module"
                                    name="module"
                                    required
                                    className="w-full mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                                    value={formData.module}
                                    onChange={handleMetadataChange}
                                />
                            </div>
                            <div>
                                <Label>Difficulty</Label>
                                <div className="w-full mt-1">
                                    <Select
                                        value={formData.difficulty}
                                        onValueChange={(val: any) => setFormData((prev: TopicCreate) => ({ ...prev, difficulty: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="order">Sort Order</Label>
                                <input
                                    id="order"
                                    name="order"
                                    type="number"
                                    className="w-full mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                                    value={formData.order}
                                    onChange={(e) => setFormData((prev: TopicCreate) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="space-y-0.5">
                                    <Label>Published Status</Label>
                                    <p className="text-xs text-slate-500">Make visible to learners</p>
                                </div>
                                <Switch
                                    checked={formData.is_published}
                                    onCheckedChange={(checked) => setFormData((prev: TopicCreate) => ({ ...prev, is_published: checked }))}
                                />
                            </div>
                        </div>
                    </NeoCard>

                    <NeoCard className="p-6 sticky top-24">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Add Content</h2>
                        <div className="space-y-2">
                            {SECTION_OPTIONS.map((opt) => (
                                <NeoButton
                                    key={opt.value}
                                    variant="secondary"
                                    className="w-full justify-start text-sm"
                                    onClick={() => addSection(opt.value)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {opt.label}
                                </NeoButton>
                            ))}
                        </div>
                    </NeoCard>
                </div>
            </div>
        </div>
    );
}
