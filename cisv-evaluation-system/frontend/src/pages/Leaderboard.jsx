import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTrophy, FaMedal, FaRefresh, FaClock, FaCheck, FaUsers } from 'react-icons/fa';
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

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const RefreshButton = styled.button`
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AutoRefreshToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;

  input {
    margin-right: 0.5rem;
  }
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const LeaderboardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RankCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 5px;
    background: ${props => {
      switch(props.rank) {
        case 1: return 'linear-gradient(to bottom, #FFD700, #FFA500)';
        case 2: return 'linear-gradient(to bottom, #C0C0C0, #999)';
        case 3: return 'linear-gradient(to bottom, #CD7F32, #8B4513)';
        default: return 'linear-gradient(to bottom, #667eea, #764ba2)';
      }
    }};
  }
`;

const RankNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  background: ${props => {
    switch(props.rank) {
      case 1: return 'linear-gradient(135deg, #FFD700, #FFA500)';
      case 2: return 'linear-gradient(135deg, #C0C0C0, #999)';
      case 3: return 'linear-gradient(135deg, #CD7F32, #8B4513)';
      default: return 'linear-gradient(135deg, #667eea, #764ba2)';
    }
  }};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const RankIcon = styled.div`
  font-size: 1.2rem;
`;

const SubcampInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 1.4rem;
    color: #333;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 0.95rem;
  }
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
`;

const ProgressCircle = styled.div`
  position: relative;
  width: 80px;
  height: 80px;

  svg {
    transform: rotate(-90deg);

    circle {
      fill: none;
      stroke-width: 6;

      &.background {
        stroke: #eee;
      }

      &.progress {
        stroke: ${props => props.percentage === 100 ? '#28a745' : '#667eea'};
        stroke-dasharray: ${props => {
          const circumference = 2 * Math.PI * 35;
          return `${(props.percentage / 100) * circumference} ${circumference}`;
        }};
        stroke-dashoffset: 0;
        transition: stroke-dasharray 0.5s ease;
      }
    }
  }

  .percentage {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1rem;
    font-weight: 700;
    color: ${props => props.percentage === 100 ? '#28a745' : '#667eea'};
  }
`;

const CompletionStats = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: #666;

  .completed {
    color: #28a745;
    font-weight: 600;
  }
`;

const LastUpdated = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);

  h3 {
    margin-bottom: 1rem;
  }
`;

function Leaderboard({ camp }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [camp._id]);

  // Auto refresh mỗi 30 giây
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadLeaderboard(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, camp._id]);

  const loadLeaderboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);

      const response = await apiService.getLeaderboard(camp._id);
      setLeaderboardData(response.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Lỗi tải bảng xếp hạng:', error);
      if (!silent) {
        toast.error('Không thể tải bảng xếp hạng');
      }

      // Dữ liệu demo
      setLeaderboardData([
        {
          _id: 'subcamp3',
          name: 'Green Wolves',
          description: 'Đội Sói Xanh',
          totalEvaluations: 35,
          completedEvaluations: 35,
          percentage: 100,
          totalLeaders: 7,
          completedLeaders: 7,
          lastUpdate: new Date()
        },
        {
          _id: 'subcamp1',
          name: 'Red Dragons',
          description: 'Đội Rồng Đỏ',
          totalEvaluations: 40,
          completedEvaluations: 32,
          percentage: 80,
          totalLeaders: 8,
          completedLeaders: 6,
          lastUpdate: new Date()
        },
        {
          _id: 'subcamp2',
          name: 'Blue Eagles',
          description: 'Đội Đại Bàng Xanh',
          totalEvaluations: 30,
          completedEvaluations: 20,
          percentage: 67,
          totalLeaders: 6,
          completedLeaders: 4,
          lastUpdate: new Date()
        }
      ]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadLeaderboard();
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <FaTrophy />;
      case 2: return <FaMedal />;
      case 3: return <FaMedal />;
      default: return rank;
    }
  };

  // Tính tổng số liệu
  const totalStats = leaderboardData.reduce((acc, item) => {
    acc.totalEvaluations += item.totalEvaluations;
    acc.completedEvaluations += item.completedEvaluations;
    acc.totalSubcamps += 1;
    acc.completedSubcamps += item.percentage === 100 ? 1 : 0;
    return acc;
  }, {
    totalEvaluations: 0,
    completedEvaluations: 0,
    totalSubcamps: 0,
    completedSubcamps: 0
  });

  const overallProgress = totalStats.totalEvaluations > 0 
    ? Math.round((totalStats.completedEvaluations / totalStats.totalEvaluations) * 100)
    : 0;

  if (loading) {
    return <LoadingSpinner message="Đang tải bảng xếp hạng..." />;
  }

  return (
    <Container>
      <Header>
        <Title>Bảng Xếp Hạng</Title>
        <Subtitle>{camp.name}</Subtitle>
      </Header>

      <Controls>
        <RefreshButton 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaRefresh className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Đang cập nhật...' : 'Cập nhật'}
        </RefreshButton>

        <AutoRefreshToggle>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Tự động cập nhật (30s)
        </AutoRefreshToggle>
      </Controls>

      <StatsOverview>
        <StatCard>
          <StatNumber>{totalStats.completedEvaluations}</StatNumber>
          <StatLabel>Đánh giá hoàn thành</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{totalStats.totalEvaluations}</StatNumber>
          <StatLabel>Tổng số đánh giá</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{overallProgress}%</StatNumber>
          <StatLabel>Tiến độ chung</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{totalStats.completedSubcamps}/{totalStats.totalSubcamps}</StatNumber>
          <StatLabel>Trại nhỏ hoàn thành</StatLabel>
        </StatCard>
      </StatsOverview>

      {leaderboardData.length === 0 ? (
        <EmptyState>
          <h3>Chưa có dữ liệu</h3>
          <p>Chưa có trại nhỏ nào bắt đầu đánh giá</p>
        </EmptyState>
      ) : (
        <LeaderboardGrid>
          {leaderboardData.map((subcamp, index) => (
            <RankCard key={subcamp._id} rank={index + 1}>
              <RankNumber rank={index + 1}>
                <RankIcon>{getRankIcon(index + 1)}</RankIcon>
              </RankNumber>

              <SubcampInfo>
                <h3>
                  <FaUsers />
                  {subcamp.name}
                </h3>
                <p>{subcamp.description}</p>
                <p>
                  {subcamp.completedLeaders}/{subcamp.totalLeaders} leaders đã hoàn thành
                </p>
              </SubcampInfo>

              <ProgressSection>
                <ProgressCircle percentage={subcamp.percentage}>
                  <svg width="80" height="80">
                    <circle
                      className="background"
                      cx="40"
                      cy="40"
                      r="35"
                    />
                    <circle
                      className="progress"
                      cx="40"
                      cy="40"
                      r="35"
                    />
                  </svg>
                  <div className="percentage">{subcamp.percentage}%</div>
                </ProgressCircle>

                <CompletionStats>
                  <div className="completed">
                    {subcamp.completedEvaluations}/{subcamp.totalEvaluations}
                  </div>
                  <div>đánh giá</div>
                </CompletionStats>
              </ProgressSection>
            </RankCard>
          ))}
        </LeaderboardGrid>
      )}

      {lastUpdated && (
        <LastUpdated>
          <FaClock />
          Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}
        </LastUpdated>
      )}
    </Container>
  );
}

export default Leaderboard;
