import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ClipLoader } from 'react-spinners';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
`;

const CustomSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

function LoadingSpinner({ message = "Đang tải...", size = 50, color = "#ffffff" }) {
  return (
    <LoadingContainer>
      <ClipLoader color={color} size={size} />
      <LoadingText>{message}</LoadingText>
    </LoadingContainer>
  );
}

export default LoadingSpinner;
