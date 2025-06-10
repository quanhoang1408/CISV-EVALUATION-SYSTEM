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
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`,
      data: config.data,
      params: config.params
    });
    
    // Thêm token nếu có
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Auth token added to request');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : null,
      request: error.request ? 'Request made but no response' : null
    });

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
      console.log('🌐 Network error - no response received');
      toast.error('Không thể kết nối đến server');
    } else {
      console.log('⚙️ Request setup error');
      toast.error('Có lỗi xảy ra');
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Camps
  getCamps: () => {
    console.log('🏕️ Getting all camps...');
    return api.get('/camps');
  },
  getCamp: (id) => {
    console.log('🏕️ Getting camp by ID:', id);
    return api.get(`/camps/${id}`);
  },

  // Subcamps
  getSubcamps: () => {
    console.log('🏘️ Getting all subcamps...');
    return api.get('/subcamps');
  },
  getSubcampsByCamp: (campId) => {
    console.log('🏘️ Getting subcamps for camp:', campId);
    return api.get(`/subcamps/camp/${campId}`);
  },

  // Leaders
  getLeaders: () => {
    console.log('👨‍🏫 Getting all leaders...');
    return api.get('/leaders');
  },
  getLeadersBySubcamp: (subcampId) => {
    console.log('👨‍🏫 Getting leaders for subcamp:', subcampId);
    return api.get(`/leaders/subcamp/${subcampId}`);
  },
  getLeaderWithKids: (leaderId) => {
    console.log('👨‍🏫 Getting leader with kids:', leaderId);
    return api.get(`/leaders/${leaderId}/kids`);
  },

  // Kids
  getKids: () => {
    console.log('🧒 Getting all kids...');
    return api.get('/kids');
  },
  getKidsByLeader: (leaderId) => {
    console.log('🧒 Getting kids for leader:', leaderId);
    return api.get(`/kids/leader/${leaderId}`);
  },
  getKid: (id) => {
    console.log('🧒 Getting kid by ID:', id);
    return api.get(`/kids/${id}`);
  },

  // Questions
  getQuestions: () => {
    console.log('❓ Getting all questions...');
    return api.get('/questions');
  },

  // Evaluations
  getEvaluationsByLeader: (leaderId) => {
    console.log('📊 Getting evaluations for leader:', leaderId);
    return api.get(`/evaluations/leader/${leaderId}`);
  },
  autoSaveEvaluation: (data) => {
    console.log('💾 Auto-saving evaluation:', data);
    return api.post('/evaluations/auto-save', data);
  },
  submitEvaluation: (data) => {
    console.log('📤 Submitting evaluation:', data);
    return api.post('/evaluations/submit', data);
  },
  getLeaderboard: (campId) => {
    console.log('🏆 Getting leaderboard for camp:', campId);
    return api.get(`/evaluations/leaderboard/${campId}`);
  },
  getProgress: (subcampId) => {
    console.log('📈 Getting progress for subcamp:', subcampId);
    return api.get(`/evaluations/progress/${subcampId}`);
  },
};

export default api;
