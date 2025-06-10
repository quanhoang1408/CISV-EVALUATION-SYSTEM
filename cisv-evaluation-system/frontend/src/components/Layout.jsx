import React from 'react';
import styled from 'styled-components';
import { FaHome, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const Navigation = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#333'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.active ? 'transparent' : '#ddd'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.1)'};
    color: ${props => props.active ? 'white' : '#667eea'};
    border-color: #667eea;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;

    span {
      display: none;
    }
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

function Layout({ children, onReset }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    navigate('/');
  };

  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <Logo>CISV Evaluation</Logo>
          <Navigation>
            <NavButton 
              active={location.pathname === '/' || location.pathname.includes('camp') || location.pathname.includes('leader')}
              onClick={() => handleNavigation('/')}
            >
              <FaHome />
              <span>Trang chủ</span>
            </NavButton>

            <NavButton 
              active={location.pathname === '/leaderboard'}
              onClick={() => handleNavigation('/leaderboard')}
              disabled={!location.pathname.includes('camp')}
            >
              <FaChartBar />
              <span>Bảng xếp hạng</span>
            </NavButton>

            <NavButton onClick={handleReset}>
              <FaSignOutAlt />
              <span>Reset</span>
            </NavButton>
          </Navigation>
        </HeaderContent>
      </Header>

      <Main>
        {children}
      </Main>
    </LayoutContainer>
  );
}

export default Layout;
