const STORAGE_PREFIX = 'cisv_evaluation_';

export const localStorageService = {
  // Lưu dữ liệu
  setItem: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(STORAGE_PREFIX + key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Lấy dữ liệu
  getItem: (key) => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  // Xóa dữ liệu
  removeItem: (key) => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // Xóa tất cả dữ liệu của app
  clear: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Lấy tất cả keys của app
  getAllKeys: () => {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.replace(STORAGE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  },

  // Kiểm tra localStorage có khả dụng không
  isAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Lấy kích thước storage đã sử dụng
  getStorageSize: () => {
    try {
      let total = 0;
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          total += localStorage.getItem(key).length;
        }
      });
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
};

export default localStorageService;
