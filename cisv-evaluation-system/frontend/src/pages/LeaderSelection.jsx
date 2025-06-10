import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaChildren, FaArrowRight, FaArrowLeft, FaCheck, FaClock, FaPlay } from 'react-icons/fa';
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

const LeadersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const LeaderCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.selected ? '#667eea' : 'transparent'};
  position: relative;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${props => {
    switch(props.status) {
      case 'completed':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'in-progress':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      default:
        return `
          background: #f8d7da;
          color: #721c24;
        `;
    }
  }}
`;

const LeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

const LeaderDetails = styled.div`
  flex: 1;

  h3 {
    font-size: 1.3rem;
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #666;
    margin: 0;
  }
`;

const KidsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h4`
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const KidsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
`;

const KidChip = styled.div`
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.9rem;
  color: #495057;

  .name {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .age {
    font-size: 0.8rem;
    color: #6c757d;
  }
`;

const ProgressSection = styled.div`
  margin-bottom: 2rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
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
  display: flex;
  justify-content: space-between;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 15px;
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
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  ${props => {
    switch(props.variant) {
      case 'start':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        `;
      case 'continue':
        return `
          background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%);
          color: white;
        `;
      case 'completed':
        return `
          background: #28a745;
          color: white;
          cursor: default;
        `;
      default:
        return `
          background: #6c757d;
          color: white;
        `;
    }
  }}
`;

function LeaderSelection({ camp, subcamp, onLeaderSelect, selectedLeader }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLeaders();
  }, [subcamp._id]);

  const loadLeaders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLeadersBySubcamp(subcamp._id);
      setLeaders(response.data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách leader:', error);
      toast.error('Không thể tải danh sách leader');
      // Dữ liệu demo
      setLeaders([
        {
          _id: 'leader1',
          name: 'Nguyễn Minh Tuấn',
          email: 'tuan@example.com',
          kids: [
            { _id: 'kid1', name: 'An', age: 12 },
            { _id: 'kid2', name: 'Bình', age: 11 },
            { _id: 'kid3', name: 'Chi', age: 13 },
            { _id: 'kid4', name: 'Dung', age: 12 }
          ],
          evaluationStatus: 'not-started',
          progress: 0
        },
        {
          _id: 'leader2',
          name: 'Trần Thị Lan',
          email: 'lan@example.com',
          kids: [
            { _id: 'kid5', name: 'Em', age: 10 },
            { _id: 'kid6', name: 'Phong', age: 12 },
            { _id: 'kid7', name: 'Giang', age: 11 }
          ],
          evaluationStatus: 'in-progress',
          progress: 60
        },
        {
          _id: 'leader3',
          name: 'Lê Văn Hùng',
          email: 'hung@example.com',
          kids: [
            { _id: 'kid8', name: 'Hoa', age: 13 },
            { _id: 'kid9', name: 'Khang', age: 12 },
            { _id: 'kid10', name: 'Linh', age: 11 },
            { _id: 'kid11', name: 'Minh', age: 12 },
            { _id: 'kid12', name: 'Nam', age: 13 }
          ],
          evaluationStatus: 'completed',
          progress: 100
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaderSelect = (leader) => {
    if (leader.evaluationStatus === 'completed') {
      toast.info('Leader này đã hoàn thành đánh giá');
      return;
    }

    onLeaderSelect(leader);
    toast.success(`Đã chọn leader: ${leader.name}`);
    navigate('/evaluation');
  };

  const handleBack = () => {
    navigate('/subcamp');
  };

  const getStatusInfo = (status, progress) => {
    switch(status) {
      case 'completed':
        return { 
          text: 'Hoàn thành', 
          icon: <FaCheck />,
          variant: 'completed'
        };
      case 'in-progress':
        return { 
          text: 'Đang thực hiện', 
          icon: <FaClock />,
          variant: 'continue'
        };
      default:
        return { 
          text: 'Chưa bắt đầu', 
          icon: <FaPlay />,
          variant: 'start'
        };
    }
  };

  const getButtonText = (status) => {
    switch(status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'in-progress':
        return 'Tiếp tục đánh giá';
      default:
        return 'Bắt đầu đánh giá';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách leader..." />;
  }

  return (
    <Container>
      <Header>
        <Title>Chọn Leader</Title>
        <Subtitle>{camp.name} • {subcamp.name}</Subtitle>
      </Header>

      <BreadcrumbNav>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
          <span>Quay lại chọn trại nhỏ</span>
        </BackButton>
      </BreadcrumbNav>

      <LeadersGrid>
        {leaders.map((leader) => {
          const statusInfo = getStatusInfo(leader.evaluationStatus, leader.progress);

          return (
            <LeaderCard
              key={leader._id}
              selected={selectedLeader?._id === leader._id}
              onClick={() => handleLeaderSelect(leader)}
            >
              <StatusBadge status={leader.evaluationStatus}>
                {statusInfo.icon}
                {statusInfo.text}
              </StatusBadge>

              <LeaderInfo>
                <Avatar>
                  {leader.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Avatar>
                <LeaderDetails>
                  <h3>{leader.name}</h3>
                  <p>{leader.email}</p>
                </LeaderDetails>
              </LeaderInfo>

              <KidsSection>
                <SectionTitle>
                  <FaChildren />
                  Trẻ em được phân công ({leader.kids?.length || 0})
                </SectionTitle>
                <KidsGrid>
                  {leader.kids?.map(kid => (
                    <KidChip key={kid._id}>
                      <div className="name">{kid.name}</div>
                      <div className="age">{kid.age} tuổi</div>
                    </KidChip>
                  ))}
                </KidsGrid>
              </KidsSection>

              {leader.evaluationStatus !== 'not-started' && (
                <ProgressSection>
                  <SectionTitle>Tiến độ đánh giá</SectionTitle>
                  <ProgressBar>
                    <ProgressFill percentage={leader.progress} />
                  </ProgressBar>
                  <ProgressText>
                    <span>{leader.progress}% hoàn thành</span>
                  </ProgressText>
                </ProgressSection>
              )}

              <ActionButton
                variant={statusInfo.variant}
                disabled={leader.evaluationStatus === 'completed'}
              >
                {statusInfo.icon}
                <span>{getButtonText(leader.evaluationStatus)}</span>
                {leader.evaluationStatus !== 'completed' && <FaArrowRight />}
              </ActionButton>
            </LeaderCard>
          );
        })}
      </LeadersGrid>
    </Container>
  );
}

export default LeaderSelection;
