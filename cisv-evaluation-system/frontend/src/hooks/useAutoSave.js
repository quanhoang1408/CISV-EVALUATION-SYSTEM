import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { localStorageService } from '../services/localStorage';
import { useEvaluation } from '../contexts/EvaluationContext';
import { toast } from 'react-toastify';

const AUTOSAVE_INTERVAL = parseInt(process.env.REACT_APP_AUTOSAVE_INTERVAL) || 30000; // 30 seconds

export const useAutoSave = (leaderId) => {
  const { evaluations, setSaveStatus, isOnline } = useEvaluation();
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const autoSaveRef = useRef(null);
  const pendingChangesRef = useRef(false);

  // Hàm lưu dữ liệu
  const saveEvaluations = useCallback(async (data, isAutoSave = false) => {
    if (!data || Object.keys(data).length === 0) {
      return { success: false, message: 'Không có dữ liệu để lưu' };
    }

    setSaveStatus({ isSaving: true, error: null });

    try {
      if (isOnline) {
        // Lưu lên server
        const response = await apiService.autoSaveEvaluation({
          leaderId,
          evaluations: data,
          timestamp: new Date().toISOString()
        });

        // Lưu vào localStorage như backup
        localStorageService.setItem(`evaluations_${leaderId}`, data);

        const saveTime = new Date();
        setLastSaveTime(saveTime);
        setSaveStatus({ 
          isSaving: false, 
          lastSaved: saveTime,
          error: null 
        });

        if (!isAutoSave) {
          toast.success('Đã lưu thành công');
        }

        return { success: true, message: 'Đã lưu thành công' };
      } else {
        // Chế độ offline - chỉ lưu vào localStorage
        localStorageService.setItem(`evaluations_${leaderId}`, data);
        localStorageService.setItem(`offline_changes_${leaderId}`, {
          data,
          timestamp: new Date().toISOString(),
          needsSync: true
        });

        const saveTime = new Date();
        setLastSaveTime(saveTime);
        setSaveStatus({ 
          isSaving: false, 
          lastSaved: saveTime,
          error: null 
        });

        if (!isAutoSave) {
          toast.info('Đã lưu offline - sẽ đồng bộ khi có mạng');
        }

        return { success: true, message: 'Đã lưu offline' };
      }
    } catch (error) {
      console.error('Lỗi khi lưu:', error);

      // Fallback to localStorage nếu server lỗi
      try {
        localStorageService.setItem(`evaluations_${leaderId}`, data);
        localStorageService.setItem(`offline_changes_${leaderId}`, {
          data,
          timestamp: new Date().toISOString(),
          needsSync: true
        });

        setSaveStatus({ 
          isSaving: false, 
          error: 'Lưu offline do lỗi server' 
        });

        if (!isAutoSave) {
          toast.warn('Lưu offline do lỗi server');
        }

        return { success: true, message: 'Đã lưu offline do lỗi server' };
      } catch (localError) {
        setSaveStatus({ 
          isSaving: false, 
          error: 'Không thể lưu dữ liệu' 
        });

        toast.error('Không thể lưu dữ liệu');
        return { success: false, message: 'Không thể lưu dữ liệu' };
      }
    }
  }, [leaderId, isOnline, setSaveStatus]);

  // Auto-save
  const performAutoSave = useCallback(async () => {
    if (!pendingChangesRef.current || !evaluations) {
      return;
    }

    // Lọc ra evaluations của leader hiện tại
    const leaderEvaluations = Object.keys(evaluations)
      .filter(key => key.startsWith(`${leaderId}_`))
      .reduce((obj, key) => {
        obj[key] = evaluations[key];
        return obj;
      }, {});

    if (Object.keys(leaderEvaluations).length > 0) {
      await saveEvaluations(leaderEvaluations, true);
      pendingChangesRef.current = false;
    }
  }, [evaluations, leaderId, saveEvaluations]);

  // Thiết lập auto-save interval
  useEffect(() => {
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }

    autoSaveRef.current = setInterval(performAutoSave, AUTOSAVE_INTERVAL);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [performAutoSave]);

  // Đánh dấu có thay đổi khi evaluations thay đổi
  useEffect(() => {
    pendingChangesRef.current = true;
  }, [evaluations]);

  // Đồng bộ dữ liệu offline khi có mạng trở lại
  useEffect(() => {
    const syncOfflineData = async () => {
      if (isOnline) {
        const offlineChanges = localStorageService.getItem(`offline_changes_${leaderId}`);
        if (offlineChanges && offlineChanges.needsSync) {
          try {
            await apiService.autoSaveEvaluation({
              leaderId,
              evaluations: offlineChanges.data,
              timestamp: offlineChanges.timestamp
            });

            // Xóa dữ liệu offline sau khi đồng bộ thành công
            localStorageService.removeItem(`offline_changes_${leaderId}`);
            toast.success('Đã đồng bộ dữ liệu offline');
          } catch (error) {
            console.error('Lỗi đồng bộ dữ liệu offline:', error);
            toast.error('Không thể đồng bộ dữ liệu offline');
          }
        }
      }
    };

    syncOfflineData();
  }, [isOnline, leaderId]);

  // Manual save
  const manualSave = useCallback(async () => {
    const leaderEvaluations = Object.keys(evaluations)
      .filter(key => key.startsWith(`${leaderId}_`))
      .reduce((obj, key) => {
        obj[key] = evaluations[key];
        return obj;
      }, {});

    return await saveEvaluations(leaderEvaluations, false);
  }, [evaluations, leaderId, saveEvaluations]);

  // Format thời gian lần lưu cuối
  const getFormattedLastSaveTime = useCallback(() => {
    if (!lastSaveTime) return null;

    const now = new Date();
    const diff = Math.floor((now - lastSaveTime) / 1000);

    if (diff < 60) {
      return `${diff} giây trước`;
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} phút trước`;
    } else {
      return lastSaveTime.toLocaleTimeString('vi-VN');
    }
  }, [lastSaveTime]);

  return {
    manualSave,
    lastSaveTime,
    getFormattedLastSaveTime,
    isAutoSaving: autoSaveRef.current !== null
  };
};

export default useAutoSave;
