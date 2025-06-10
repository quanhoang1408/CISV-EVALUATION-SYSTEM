import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUsers, FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';
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
  margin: 0 0 1rem 0;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const SubcampsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SubcampCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.selected ? '#667eea' : 'transparent'};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  }
`;

const SubcampName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const SubcampDescription = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const SubcampStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
`;

const StatItem = styled.div`
  text-align: center;

  .number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
    display: block;
  }

  .label {
    font-size: 0.9rem;
    color: #666;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-align: center;
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

const CompletedBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #28a745;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function SubcampSelection({ camp, onSubcampSelect, selectedSubcamp }) {
  const [subcamps, setSubcamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubcamps();
  }, [camp._id]);

  const loadSubcamps = async () => {
    try {
      setLoading(true);
      console.log('🏘️ Loading subcamps for camp:', camp._id);
      
      const response = await apiService.getSubcampsByCamp(camp._id);
      console.log('📥 Subcamps API Response:', response);
      console.log('📥 Subcamps Response.data:', response.data);
      console.log('📥 Is subcamps response.data array?', Array.isArray(response.data));
      
      // Xử lý API response structure tương tự như các component khác
      let subcampsData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          subcampsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('📥 Found nested subcamps data array:', response.data.data);
          subcampsData = response.data.data;
        } else {
          console.log('⚠️ subcamps response.data structure unexpected:', response.data);
          subcampsData = [];
        }
      }
      
      console.log('🏘️ Subcamps loaded:', subcampsData);
      console.log('🏘️ Subcamps count:', subcampsData.length);

      // Load thêm thông tin progress cho mỗi subcamp
      const subcampsWithProgress = await Promise.all(
        subcampsData.map(async (subcamp) => {
          try {
            console.log('📊 Loading progress for subcamp:', subcamp._id);
            const progressResponse = await apiService.getProgress(subcamp._id);
            console.log('📊 Progress response for', subcamp.name, ':', progressResponse);
            
            // Xử lý progress response
            let progressData = { percentage: 0, totalEvaluations: 0, completedEvaluations: 0 };
            if (progressResponse && progressResponse.data) {
              if (progressResponse.data.data && progressResponse.data.data.progress) {
                progressData = progressResponse.data.data.progress;
              } else if (progressResponse.data.progress) {
                progressData = progressResponse.data.progress;
              }
            }

            // Load số lượng leaders
            console.log('👨‍🏫 Loading leaders count for subcamp:', subcamp._id);
            const leadersResponse = await apiService.getLeadersBySubcamp(subcamp._id);
            console.log('👨‍🏫 Leaders response for', subcamp.name, ':', leadersResponse);
            
            let leadersData = [];
            if (leadersResponse && leadersResponse.data) {
              if (Array.isArray(leadersResponse.data)) {
                leadersData = leadersResponse.data;
              } else if (leadersResponse.data.data && Array.isArray(leadersResponse.data.data)) {
                leadersData = leadersResponse.data.data;
              }
            }

            const totalLeaders = leadersData.length;
            const completedLeaders = leadersData.filter(leader => 
              leader.evaluationProgress?.status === 'completed' || 
              leader.evaluationStatus === 'completed'
            ).length;

            const enhancedSubcamp = {
              ...subcamp,
              totalLeaders,
              completedLeaders,
              totalEvaluations: progressData.totalEvaluations || 0,
              completedEvaluations: progressData.completedEvaluations || 0,
              progress: progressData.percentage || 0,
              averageRating: progressData.averageRating || 0
            };

            console.log('✅ Enhanced subcamp data:', enhancedSubcamp);
            return enhancedSubcamp;
          } catch (error) {
            console.error(`❌ Error loading progress for ${subcamp.name}:`, error);
            return {
              ...subcamp,
              totalLeaders: 0,
              completedLeaders: 0,
              totalEvaluations: 0,
              completedEvaluations: 0,
              progress: 0,
              averageRating: 0
            };
          }
        })
      );

      console.log('🏘️ Final subcamps with progress:', subcampsWithProgress);
      setSubcamps(subcampsWithProgress);
    } catch (error) {
      console.error('❌ Lỗi tải danh sách trại nhỏ:', error);
      toast.error('Không thể tải danh sách trại nhỏ');
      
      // Dữ liệu demo
      const demoData = [
        {
          _id: 'subcamp1',
          name: 'Red Dragons',
          description: 'Đội Rồng Đỏ - Năng động và sáng tạo',
          color: '#ff4757',
          totalLeaders: 8,
          completedLeaders: 6,
          totalEvaluations: 40,
          completedEvaluations: 30,
          progress: 75
        },
        {
          _id: 'subcamp2',
          name: 'Blue Eagles',
          description: 'Đội Đại Bàng Xanh - Mạnh mẽ và đoàn kết',
          color: '#3742fa',
          totalLeaders: 6,
          completedLeaders: 4,
          totalEvaluations: 30,
          completedEvaluations: 20,
          progress: 67
        },
        {
          _id: 'subcamp3',
          name: 'Green Wolves',
          description: 'Đội Sói Xanh - Thông minh và linh hoạt',
          color: '#2ed573',
          totalLeaders: 7,
          completedLeaders: 7,
          totalEvaluations: 35,
          completedEvaluations: 35,
          progress: 100
        }
      ];
      
      console.log('📋 Using demo subcamps data:', demoData);
      setSubcamps(demoData);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcampSelect = (subcamp) => {
    onSubcampSelect(subcamp);
    toast.success(`Đã chọn trại nhỏ: ${subcamp.name}`);
    navigate('/leader');
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách trại nhỏ..." />;
  }

  return (
    <Container>
      <Header>
        <Title>Chọn Trái Nhỏ</Title>
        <Subtitle>Trại: {camp.name}</Subtitle>
      </Header>

      <BreadcrumbNav>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
          <span>Quay lại chọn trại</span>
        </BackButton>
      </BreadcrumbNav>

      <SubcampsGrid>
        {subcamps.map((subcamp) => (
          <SubcampCard
            key={subcamp._id}
            selected={selectedSubcamp?._id === subcamp._id}
            color={subcamp.color}
            onClick={() => handleSubcampSelect(subcamp)}
          >
            {subcamp.progress === 100 && (
              <CompletedBadge>
                <FaCheck />
              </CompletedBadge>
            )}

            <SubcampName>{subcamp.name}</SubcampName>
            <SubcampDescription>{subcamp.description}</SubcampDescription>

            <SubcampStats>
              <StatItem>
                <span className="number">{subcamp.totalLeaders}</span>
                <span className="label">Leaders</span>
              </StatItem>
              <StatItem>
                <span className="number">{subcamp.completedEvaluations}/{subcamp.totalEvaluations}</span>
                <span className="label">Đánh giá</span>
              </StatItem>
            </SubcampStats>

            <ProgressBar>
              <ProgressFill percentage={subcamp.progress} />
            </ProgressBar>
            <ProgressText>{subcamp.progress}% hoàn thành</ProgressText>

            <SelectButton>
              <span>Chọn trại nhỏ này</span>
              <FaArrowRight />
            </SelectButton>
          </SubcampCard>
        ))}
      </SubcampsGrid>
    </Container>
  );
}

export default SubcampSelection;
