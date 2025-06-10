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
      const response = await apiService.getSubcampsByCamp(camp._id);
      setSubcamps(response.data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách trại nhỏ:', error);
      toast.error('Không thể tải danh sách trại nhỏ');
      // Dữ liệu demo
      setSubcamps([
        {
          _id: 'subcamp1',
          name: 'Red Dragons',
          description: 'Đội Rồng Đỏ - Năng động và sáng tạo',
          color: '#ff4757',
          totalLeaders: 8,
          completedEvaluations: 6,
          totalEvaluations: 8,
          progress: 75
        },
        {
          _id: 'subcamp2',
          name: 'Blue Eagles',
          description: 'Đội Đại Bàng Xanh - Mạnh mẽ và đoàn kết',
          color: '#3742fa',
          totalLeaders: 6,
          completedEvaluations: 4,
          totalEvaluations: 6,
          progress: 67
        },
        {
          _id: 'subcamp3',
          name: 'Green Wolves',
          description: 'Đội Sói Xanh - Thông minh và linh hoạt',
          color: '#2ed573',
          totalLeaders: 7,
          completedEvaluations: 7,
          totalEvaluations: 7,
          progress: 100
        }
      ]);
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
