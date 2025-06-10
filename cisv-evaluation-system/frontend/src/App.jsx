import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';

// Components
import Layout from './components/Layout';
import CampSelection from './pages/CampSelection';
import SubcampSelection from './pages/SubcampSelection';
import LeaderSelection from './pages/LeaderSelection';
import EvaluationForm from './pages/EvaluationForm';
import Leaderboard from './pages/Leaderboard';
import LoadingSpinner from './components/LoadingSpinner';

// Services
import { localStorageService } from './services/localStorage';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

function App() {
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [selectedSubcamp, setSelectedSubcamp] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục state từ localStorage khi app khởi động
  useEffect(() => {
    console.log('🚀 App component mounted');
    console.log('💾 Attempting to restore state from localStorage...');
    
    try {
      const savedState = localStorageService.getItem('app_state');
      console.log('📥 Saved state from localStorage:', savedState);
      
      if (savedState) {
        console.log('✅ Restoring state:', savedState);
        setSelectedCamp(savedState.selectedCamp || null);
        setSelectedSubcamp(savedState.selectedSubcamp || null);
        setSelectedLeader(savedState.selectedLeader || null);
      } else {
        console.log('ℹ️ No saved state found');
      }
    } catch (error) {
      console.error('❌ Error restoring state:', error);
      toast.warn('Không thể khôi phục dữ liệu đã lưu trước đó');
    }
    setIsLoading(false);
    console.log('✅ App initialization completed');
  }, []);

  // Lưu state vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    console.log('💾 Saving app state to localStorage:', {
      selectedCamp: selectedCamp?.name,
      selectedSubcamp: selectedSubcamp?.name,
      selectedLeader: selectedLeader?.name
    });
    
    const appState = {
      selectedCamp,
      selectedSubcamp,
      selectedLeader,
      timestamp: new Date().toISOString()
    };
    localStorageService.setItem('app_state', appState);
  }, [selectedCamp, selectedSubcamp, selectedLeader]);

  // Handlers cho việc chọn camp, subcamp, leader
  const handleCampSelect = (camp) => {
    console.log('🏕️ Camp selected in App:', camp);
    setSelectedCamp(camp);
    setSelectedSubcamp(null);
    setSelectedLeader(null);
  };

  const handleSubcampSelect = (subcamp) => {
    console.log('🏘️ Subcamp selected in App:', subcamp);
    setSelectedSubcamp(subcamp);
    setSelectedLeader(null);
  };

  const handleLeaderSelect = (leader) => {
    console.log('👨‍🏫 Leader selected in App:', leader);
    setSelectedLeader(leader);
  };

  const handleReset = () => {
    console.log('🔄 Resetting app state');
    setSelectedCamp(null);
    setSelectedSubcamp(null);
    setSelectedLeader(null);
    localStorageService.removeItem('app_state');
    toast.success('Đã reset về trang chủ');
  };

  if (isLoading) {
    return (
      <AppContainer>
        <Layout>
          <LoadingSpinner message="Đang tải ứng dụng..." />
        </Layout>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Layout onReset={handleReset}>
        <Routes>
          {/* Trang chọn trại */}
          <Route 
            path="/" 
            element={
              <CampSelection 
                onCampSelect={handleCampSelect}
                selectedCamp={selectedCamp}
              />
            } 
          />

          {/* Trang chọn trại nhỏ */}
          <Route 
            path="/subcamp" 
            element={
              selectedCamp ? (
                <SubcampSelection 
                  camp={selectedCamp}
                  onSubcampSelect={handleSubcampSelect}
                  selectedSubcamp={selectedSubcamp}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Trang chọn leader */}
          <Route 
            path="/leader" 
            element={
              selectedCamp && selectedSubcamp ? (
                <LeaderSelection 
                  camp={selectedCamp}
                  subcamp={selectedSubcamp}
                  onLeaderSelect={handleLeaderSelect}
                  selectedLeader={selectedLeader}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Trang đánh giá */}
          <Route 
            path="/evaluation" 
            element={
              selectedCamp && selectedSubcamp && selectedLeader ? (
                <EvaluationForm 
                  camp={selectedCamp}
                  subcamp={selectedSubcamp}
                  leader={selectedLeader}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Trang bảng xếp hạng */}
          <Route 
            path="/leaderboard" 
            element={
              selectedCamp ? (
                <Leaderboard camp={selectedCamp} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Redirect các route không tồn tại */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AppContainer>
  );
}

export default App;
