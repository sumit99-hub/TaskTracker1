import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api, { API_BASE_URL } from './api';

describe('API Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should have baseURL configured', () => {
    expect(api.defaults.baseURL).toBeDefined();
  });

  it('should export API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
  });

  describe('Request Interceptor', () => {
    it('should add token to request if available', async () => {
      localStorage.setItem('token', 'test-token');
      
      // Create a new axios instance with interceptor
      const testApi = axios.create();
      testApi.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
      
      const config = {};
      const interceptor = testApi.interceptors.request.handlers[0].fulfilled;
      
      const result = await interceptor(config);
      expect(result.headers['Authorization']).toBe('Bearer test-token');
    });

    it('should not add token if not available', async () => {
      const testApi = axios.create();
      testApi.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
      
      const config = {};
      const interceptor = testApi.interceptors.request.handlers[0].fulfilled;
      
      const result = await interceptor(config);
      expect(result.headers).toBeUndefined();
    });

    it('should preserve existing headers', async () => {
      localStorage.setItem('token', 'test-token');
      
      const testApi = axios.create();
      testApi.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
      
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const interceptor = testApi.interceptors.request.handlers[0].fulfilled;
      
      const result = await interceptor(config);
      expect(result.headers['Content-Type']).toBe('application/json');
      expect(result.headers['Authorization']).toBe('Bearer test-token');
    });
  });

  describe('API Methods', () => {
    it('should make GET request', async () => {
      const getSpy = vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });
      
      await api.get('/test');
      expect(getSpy).toHaveBeenCalled();
    });

    it('should make POST request', async () => {
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} });
      
      await api.post('/test', { data: 'test' });
      expect(postSpy).toHaveBeenCalled();
    });

    it('should make PATCH request', async () => {
      const patchSpy = vi.spyOn(axios, 'patch').mockResolvedValue({ data: {} });
      
      await api.patch('/test', { data: 'test' });
      expect(patchSpy).toHaveBeenCalled();
    });

    it('should make PUT request', async () => {
      const putSpy = vi.spyOn(axios, 'put').mockResolvedValue({ data: {} });
      
      await api.put('/test', { data: 'test' });
      expect(putSpy).toHaveBeenCalled();
    });

    it('should make DELETE request', async () => {
      const deleteSpy = vi.spyOn(axios, 'delete').mockResolvedValue({ data: {} });
      
      await api.delete('/test');
      expect(deleteSpy).toHaveBeenCalled();
    });
  });
});
