import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Thêm token nếu có
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi chung
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          toast.error('Không có quyền truy cập');
          break;
        case 403:
          toast.error('Bị cấm truy cập');
          break;
        case 404:
          toast.error('Không tìm thấy dữ liệu');
          break;
        case 500:
          toast.error('Lỗi server. Vui lòng thử lại sau');
          break;
        default:
          toast.error(data.message || 'Có lỗi xảy ra');
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến server');
    } else {
      toast.error('Có lỗi xảy ra');
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Camps
  getCamps: () => api.get('/camps'),
  getCamp: (id) => api.get(`/camps/${id}`),

  // Subcamps
  getSubcamps: () => api.get('/subcamps'),
  getSubcampsByCamp: (campId) => api.get(`/subcamps/camp/${campId}`),

  // Leaders
  getLeaders: () => api.get('/leaders'),
  getLeadersBySubcamp: (subcampId) => api.get(`/leaders/subcamp/${subcampId}`),
  getLeaderWithKids: (leaderId) => api.get(`/leaders/${leaderId}/kids`),

  // Kids
  getKids: () => api.get('/kids'),
  getKidsByLeader: (leaderId) => api.get(`/kids/leader/${leaderId}`),
  getKid: (id) => api.get(`/kids/${id}`),

  // Questions
  getQuestions: () => api.get('/questions'),

  // Evaluations
  getEvaluationsByLeader: (leaderId) => api.get(`/evaluations/leader/${leaderId}`),
  autoSaveEvaluation: (data) => api.post('/evaluations/auto-save', data),
  submitEvaluation: (data) => api.post('/evaluations/submit', data),
  getLeaderboard: (campId) => api.get(`/evaluations/leaderboard/${campId}`),
  getProgress: (subcampId) => api.get(`/evaluations/progress/${subcampId}`),
};

export default api;
