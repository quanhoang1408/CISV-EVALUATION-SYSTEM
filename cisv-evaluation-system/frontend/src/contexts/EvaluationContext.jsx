import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { localStorageService } from '../services/localStorage';
import { toast } from 'react-toastify';

const EvaluationContext = createContext();

// Action types
const EVALUATION_ACTIONS = {
  LOAD_EVALUATIONS: 'LOAD_EVALUATIONS',
  UPDATE_EVALUATION: 'UPDATE_EVALUATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_EVALUATIONS: 'CLEAR_EVALUATIONS',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_SAVE_STATUS: 'SET_SAVE_STATUS'
};

// Initial state
const initialState = {
  evaluations: {},
  loading: false,
  error: null,
  isOnline: navigator.onLine,
  saveStatus: {
    isSaving: false,
    lastSaved: null,
    error: null
  }
};

// Reducer
function evaluationReducer(state, action) {
  switch (action.type) {
    case EVALUATION_ACTIONS.LOAD_EVALUATIONS:
      return {
        ...state,
        evaluations: action.payload,
        loading: false
      };

    case EVALUATION_ACTIONS.UPDATE_EVALUATION:
      const { leaderId, kidId, questionId, data } = action.payload;
      const evaluationKey = `${leaderId}_${kidId}_${questionId}`;

      return {
        ...state,
        evaluations: {
          ...state.evaluations,
          [evaluationKey]: {
            ...state.evaluations[evaluationKey],
            ...data,
            lastModified: new Date().toISOString()
          }
        }
      };

    case EVALUATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case EVALUATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case EVALUATION_ACTIONS.CLEAR_EVALUATIONS:
      return {
        ...state,
        evaluations: {},
        error: null
      };

    case EVALUATION_ACTIONS.SET_ONLINE_STATUS:
      return {
        ...state,
        isOnline: action.payload
      };

    case EVALUATION_ACTIONS.SET_SAVE_STATUS:
      return {
        ...state,
        saveStatus: {
          ...state.saveStatus,
          ...action.payload
        }
      };

    default:
      return state;
  }
}

// Provider component
export function EvaluationProvider({ children }) {
  const [state, dispatch] = useReducer(evaluationReducer, initialState);

  // Theo dõi trạng thái online/offline
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: EVALUATION_ACTIONS.SET_ONLINE_STATUS, payload: true });
      toast.success('Đã kết nối mạng');
    };

    const handleOffline = () => {
      dispatch({ type: EVALUATION_ACTIONS.SET_ONLINE_STATUS, payload: false });
      toast.warn('Mất kết nối mạng - Dữ liệu sẽ được lưu offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Lưu evaluations vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    if (Object.keys(state.evaluations).length > 0) {
      localStorageService.setItem('evaluations', state.evaluations);
    }
  }, [state.evaluations]);

  // Actions
  const loadEvaluations = (evaluations) => {
    dispatch({ 
      type: EVALUATION_ACTIONS.LOAD_EVALUATIONS, 
      payload: evaluations 
    });
  };

  const updateEvaluation = (leaderId, kidId, questionId, data) => {
    dispatch({
      type: EVALUATION_ACTIONS.UPDATE_EVALUATION,
      payload: { leaderId, kidId, questionId, data }
    });
  };

  const setLoading = (loading) => {
    dispatch({ 
      type: EVALUATION_ACTIONS.SET_LOADING, 
      payload: loading 
    });
  };

  const setError = (error) => {
    dispatch({ 
      type: EVALUATION_ACTIONS.SET_ERROR, 
      payload: error 
    });
  };

  const clearEvaluations = () => {
    dispatch({ type: EVALUATION_ACTIONS.CLEAR_EVALUATIONS });
    localStorageService.removeItem('evaluations');
  };

  const setSaveStatus = (status) => {
    dispatch({
      type: EVALUATION_ACTIONS.SET_SAVE_STATUS,
      payload: status
    });
  };

  const value = {
    ...state,
    loadEvaluations,
    updateEvaluation,
    setLoading,
    setError,
    clearEvaluations,
    setSaveStatus
  };

  return (
    <EvaluationContext.Provider value={value}>
      {children}
    </EvaluationContext.Provider>
  );
}

// Hook để sử dụng context
export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluation must be used within an EvaluationProvider');
  }
  return context;
}

export default EvaluationContext;
