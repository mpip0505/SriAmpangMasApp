import api from './api';

export interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  published_at: string;
  created_by_name: string;
  view_count: number;
}

export const newsService = {
  getAll: async (page = 1) => {
    const response = await api.get(`/news?page=${page}&limit=10`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },
};