import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaCalendar, FaUsers, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 500px;
  margin: 0 auto 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const CampsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CampCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.selected ? '#667eea' : 'transparent'};

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
`;

const CampName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const CampInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.95rem;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);
`;

function CampSelection({ onCampSelect, selectedCamp }) {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCamps();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('🔄 Camps state changed:', camps);
    console.log('🔄 Loading state:', loading);
    console.log('🔄 Search term:', searchTerm);
  }, [camps, loading, searchTerm]);

  const loadCamps = async () => {
    try {
      setLoading(true);
      console.log('🚀 Bắt đầu tải danh sách trại...');
      
      const response = await apiService.getCamps();
      console.log('📡 Full API Response:', response);
      console.log('📊 Response data:', response.data);
      console.log('📋 Response structure:', Object.keys(response));
      console.log('🔍 Is response.data array?', Array.isArray(response.data));
      
      // Kiểm tra cấu trúc response
      let campsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Trường hợp response.data là array trực tiếp
          campsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Trường hợp response.data.data là array (nested)
          campsData = response.data.data;
        } else if (response.data.success && Array.isArray(response.data.data)) {
          // Trường hợp có success flag
          campsData = response.data.data;
        }
      }
      
      console.log('🎯 Final camps data:', campsData);
      console.log('🔢 Number of camps:', campsData.length);
      
      setCamps(campsData);
      console.log('✅ Đã set camps:', campsData.length, 'trại');
      
    } catch (error) {
      console.error('❌ Lỗi tải danh sách trại:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      toast.error('Không thể tải danh sách trại');
      // Dữ liệu demo nếu API lỗi
      setCamps([
        {
          _id: 'camp1',
          name: 'CISV Summer Camp 2024',
          description: 'Trại hè quốc tế CISV 2024',
          startDate: '2024-07-15',
          endDate: '2024-07-25',
          totalParticipants: 120,
          status: 'active'
        },
        {
          _id: 'camp2', 
          name: 'CISV Winter Camp 2024',
          description: 'Trại đông quốc tế CISV 2024',
          startDate: '2024-12-20',
          endDate: '2024-12-30',
          totalParticipants: 80,
          status: 'planning'
        }
      ]);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished, setLoading(false) called');
    }
  };

  const filteredCamps = camps.filter(camp =>
    camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug filtered camps
  useEffect(() => {
    console.log('🔍 Filtered camps:', filteredCamps);
    console.log('🔍 Original camps length:', camps.length);
    console.log('🔍 Filtered camps length:', filteredCamps.length);
  }, [filteredCamps, camps]);

  const handleCampSelect = (camp) => {
    onCampSelect(camp);
    toast.success(`Đã chọn trại: ${camp.name}`);
    navigate('/subcamp');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách trại..." />;
  }

  return (
    <Container>
      <Header>
        <Title>Chọn Trại CISV</Title>
        <Subtitle>Chọn trại bạn muốn đánh giá trẻ em</Subtitle>
      </Header>

      <SearchContainer>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Tìm kiếm trại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      {filteredCamps.length === 0 ? (
        <EmptyState>
          <h3>Không tìm thấy trại nào</h3>
          <p>Vui lòng thử tìm kiếm với từ khóa khác</p>
        </EmptyState>
      ) : (
        <CampsGrid>
          {filteredCamps.map((camp) => (
            <CampCard
              key={camp._id}
              selected={selectedCamp?._id === camp._id}
              onClick={() => handleCampSelect(camp)}
            >
              <CampName>{camp.name}</CampName>

              <CampInfo>
                <InfoItem>
                  <FaCalendar />
                  <span>{formatDate(camp.startDate)} - {formatDate(camp.endDate)}</span>
                </InfoItem>
                <InfoItem>
                  <FaUsers />
                  <span>{camp.totalParticipants || 0} người tham gia</span>
                </InfoItem>
              </CampInfo>

              <SelectButton>
                <span>Chọn trại này</span>
                <FaArrowRight />
              </SelectButton>
            </CampCard>
          ))}
        </CampsGrid>
      )}
    </Container>
  );
}

export default CampSelection;
