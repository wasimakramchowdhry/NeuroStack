// Topic API Service with mock data (will connect to FastAPI backend)

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SectionType = 'concept' | 'visual' | 'code' | 'architecture' | 'math' | 'implementation' | 'benchmark' | 'reflection';

export interface TopicContent {
  id: string;
  topic_id: string;
  section_type: SectionType;
  content_json: any; // Using any or Record<string, unknown>
  order: number;
}

export interface TopicContentCreate {
  section_type: SectionType;
  content_json: any;
  order: number;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  module: string;
  difficulty: Difficulty;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TopicCreate {
  title: string;
  slug: string;
  module: string;
  difficulty: Difficulty;
  order?: number;
  is_published?: boolean;
}

export interface TopicDetail extends Topic {
  contents: TopicContent[];
}

export interface TopicListParams {
  module?: string;
  difficulty?: Difficulty;
  page?: number;
  limit?: number;
}

export interface TopicListResponse {
  topics: Topic[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

import { fetchApi } from './api';

export const topicAPI = {
  /**
   * Get a paginated list of topics with optional filters
   */
  async listTopics(params: TopicListParams = {}): Promise<TopicListResponse> {
    const searchParams = new URLSearchParams();
    if (params.module) searchParams.append('module', params.module);
    if (params.difficulty) searchParams.append('difficulty', params.difficulty);

    // In our backend, pagination is skip/limit
    const limit = params.limit || 20;
    const skip = ((params.page || 1) - 1) * limit;
    searchParams.append('skip', skip.toString());
    searchParams.append('limit', limit.toString());

    // backend returns List[Topic] directly, we adapt it to TopicListResponse
    const topics = await fetchApi(`/topics/?${searchParams.toString()}`);

    return {
      topics,
      total: topics.length, // Placeholder, usually backend provides total
      page: params.page || 1,
      limit,
      total_pages: 1, // Placeholder
    };
  },

  /**
   * Get a single topic by slug with all content sections
   */
  async getTopic(slug: string): Promise<TopicDetail> {
    return await fetchApi(`/topics/${slug}`);
  },

  /**
   * Create a new topic (Admin only)
   */
  async createTopic(data: TopicCreate): Promise<Topic> {
    return await fetchApi('/topics/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update topic metadata (Admin only)
   */
  async updateTopic(id: string, data: Partial<TopicCreate>): Promise<Topic> {
    return await fetchApi(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete topic (Admin only)
   */
  async deleteTopic(id: string): Promise<void> {
    await fetchApi(`/topics/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update/Replace all contents for a topic (Admin only)
   */
  async updateTopicContents(id: string, contents: TopicContentCreate[]): Promise<TopicContent[]> {
    return await fetchApi(`/topics/${id}/content`, {
      method: 'POST',
      body: JSON.stringify(contents),
    });
  },

  /**
   * Get unique modules for filtering
   */
  async getModules(): Promise<string[]> {
    return ['Fundamentals', 'LLMs', 'Optimization']; // Ideally an API call, mock for now
  },
};

