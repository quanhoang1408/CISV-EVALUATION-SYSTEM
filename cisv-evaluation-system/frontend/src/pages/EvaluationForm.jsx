import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSave, FaCheck, FaWifi, FaTimes, FaChild, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { useEvaluation } from '../contexts/EvaluationContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { localStorageService } from '../services/localStorage';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderInfo = styled.div`
  h1 {
    font-size: 1.8rem;
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 1.1rem;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => props.online ? '#d4edda' : '#f8d7da'};
  color: ${props => props.online ? '#155724' : '#721c24'};
  font-weight: 500;
  font-size: 0.9rem;
`;

const SaveStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
`;

const KidsOverview = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const KidsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const KidCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const QuestionCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const QuestionTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EvaluationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const KidEvaluation = styled.div`
  border: 2px solid #eee;
  border-radius: 15px;
  padding: 1.5rem;
  background: #fafafa;
`;

const KidName = styled.h4`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RatingContainer = styled.div`
  margin-bottom: 1rem;
`;

const RatingLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
`;

const Star = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.filled ? '#FFD700' : '#ddd'};
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #FFD700;
  }
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 2px solid #eee;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ProgressContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SaveButton = styled(ActionButton)`
  background: #28a745;
  color: white;
`;

const SubmitButton = styled(ActionButton)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

// Câu hỏi đánh giá mẫu - sẽ được thay thế bằng data từ API
const FALLBACK_QUESTIONS = [
  {
    _id: 'fallback1',
    text: "Khả năng tham gia hoạt động",
    category: "participation"
  },
  {
    _id: 'fallback2', 
    text: "Tinh thần đồng đội và hợp tác",
    category: "teamwork"
  },
  {
    _id: 'fallback3',
    text: "Khả năng lãnh đạo và sáng kiến", 
    category: "leadership"
  },
  {
    _id: 'fallback4',
    text: "Giao tiếp và kỹ năng xã hội",
    category: "communication"
  },
  {
    _id: 'fallback5',
    text: "Thái độ và hành vi tích cực",
    category: "behavior"
  }
];

function EvaluationForm({ camp, subcamp, leader }) {
  const [kids, setKids] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { isOnline, setSaveStatus, saveStatus } = useEvaluation();
  const { manualSave, getFormattedLastSaveTime } = useAutoSave(leader._id);
  const navigate = useNavigate();

  // Load kids và evaluations khi component mount
  useEffect(() => {
    loadData();
  }, [leader._id]);

  const loadData = async () => {
    try {
      console.log('🔄 Loading evaluation data for leader:', leader._id);
      setLoading(true);

      // Tải danh sách kids của leader
      try {
        console.log('👶 Fetching kids for leader:', leader._id);
        const kidsResponse = await apiService.getKidsByLeader(leader._id);
        
        console.log('📥 Kids API Response:', kidsResponse);
        console.log('📥 Kids Response.data:', kidsResponse.data);
        console.log('📥 Kids Response.data type:', typeof kidsResponse.data);
        console.log('📥 Is kids response.data array?', Array.isArray(kidsResponse.data));
        
        // Xử lý response structure tương tự như LeaderSelection
        let kidsData = [];
        if (kidsResponse && kidsResponse.data) {
          if (Array.isArray(kidsResponse.data)) {
            // Trường hợp response.data là array trực tiếp
            kidsData = kidsResponse.data;
          } else if (kidsResponse.data.data && Array.isArray(kidsResponse.data.data)) {
            // Trường hợp response.data là object với property data
            console.log('📥 Found nested kids data array:', kidsResponse.data.data);
            kidsData = kidsResponse.data.data;
          } else {
            console.log('⚠️ kids response.data structure unexpected:', kidsResponse.data);
            kidsData = [];
          }
        } else {
          console.log('⚠️ No kids response.data found');
          kidsData = [];
        }

        console.log('👶 Kids loaded:', kidsData);
        console.log('👶 Kids count:', kidsData.length);
        setKids(kidsData);
      } catch (error) {
        console.error('❌ Lỗi tải kids:', error);
        console.log('🔧 Using demo kids data');
        // Sử dụng kids data từ leader object nếu có
        if (leader.kids && Array.isArray(leader.kids)) {
          console.log('📋 Using kids from leader object:', leader.kids);
          setKids(leader.kids);
        } else {
          // Dữ liệu demo nếu API lỗi và không có kids trong leader
          const demoKids = [
            { _id: 'kid1', name: 'Nguyễn Văn A', age: 12, nationality: 'Vietnam' },
            { _id: 'kid2', name: 'Trần Thị B', age: 11, nationality: 'Vietnam' },
            { _id: 'kid3', name: 'Lê Minh C', age: 13, nationality: 'Vietnam' },
            { _id: 'kid4', name: 'Phạm Thu D', age: 12, nationality: 'Vietnam' }
          ];
          console.log('📋 Using demo kids data:', demoKids);
          setKids(demoKids);
        }
      }

      // Tải danh sách questions
      try {
        console.log('❓ Fetching questions...');
        const questionsResponse = await apiService.getQuestions();
        
        console.log('📥 Questions API Response:', questionsResponse);
        console.log('📥 Questions Response.data:', questionsResponse.data);
        
        let questionsData = [];
        if (questionsResponse && questionsResponse.data) {
          if (Array.isArray(questionsResponse.data)) {
            questionsData = questionsResponse.data;
          } else if (questionsResponse.data.data && Array.isArray(questionsResponse.data.data)) {
            console.log('📥 Found nested questions data array:', questionsResponse.data.data);
            questionsData = questionsResponse.data.data;
          } else {
            console.log('⚠️ questions response.data structure unexpected:', questionsResponse.data);
            questionsData = [];
          }
        }

        console.log('❓ Questions loaded:', questionsData);
        console.log('❓ Questions count:', questionsData.length);
        
        if (questionsData.length > 0) {
          setQuestions(questionsData);
        } else {
          console.log('🔧 Using fallback questions');
          setQuestions(FALLBACK_QUESTIONS);
        }
      } catch (error) {
        console.error('❌ Lỗi tải questions:', error);
        console.log('🔧 Using fallback questions');
        setQuestions(FALLBACK_QUESTIONS);
      }

      // Khôi phục evaluations từ localStorage
      console.log('💾 Loading saved evaluations from localStorage...');
      const savedEvaluations = localStorageService.getItem(`evaluations_${leader._id}`);
      if (savedEvaluations) {
        console.log('📥 Found saved evaluations:', savedEvaluations);
        setEvaluations(savedEvaluations);
      } else {
        console.log('ℹ️ No saved evaluations found');
      }

    } catch (error) {
      console.error('❌ Lỗi tải dữ liệu:', error);
      toast.error('Không thể tải dữ liệu đánh giá');
    } finally {
      setLoading(false);
      console.log('✅ Evaluation data loading completed');
    }
  };

  // Cập nhật rating
  const updateRating = (kidId, questionId, rating) => {
    console.log('⭐ Updating rating:', { kidId, questionId, rating });
    const key = `${leader._id}_${kidId}_${questionId}`;
    setEvaluations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        leaderId: leader._id,
        kidId,
        questionId,
        subcampId: subcamp._id,
        rating,
        lastModified: new Date().toISOString()
      }
    }));
  };

  // Cập nhật comment
  const updateComment = (kidId, questionId, comment) => {
    console.log('💬 Updating comment:', { kidId, questionId, comment: comment.substring(0, 50) + '...' });
    const key = `${leader._id}_${kidId}_${questionId}`;
    setEvaluations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        leaderId: leader._id,
        kidId,
        questionId,
        subcampId: subcamp._id,
        comment,
        lastModified: new Date().toISOString()
      }
    }));
  };

  // Tính phần trăm hoàn thành
  const calculateProgress = () => {
    const totalQuestions = kids.length * questions.length;
    const completedQuestions = Object.values(evaluations).filter(
      evaluation => evaluation.rating > 0
    ).length;

    return totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
  };

  // Kiểm tra có thể submit không
  const canSubmit = () => {
    const totalQuestions = kids.length * questions.length;
    const completedQuestions = Object.values(evaluations).filter(
      evaluation => evaluation.rating > 0
    ).length;

    return completedQuestions === totalQuestions;
  };

  // Lưu thủ công
  const handleManualSave = async () => {
    const result = await manualSave();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  // Submit đánh giá cuối cùng
  const handleSubmit = async () => {
    if (!canSubmit()) {
      toast.error('Vui lòng hoàn thành tất cả câu hỏi đánh giá');
      return;
    }

    try {
      setSubmitting(true);

      // Chuẩn bị dữ liệu submit
      const submissionData = {
        leaderId: leader._id,
        subcampId: subcamp._id,
        campId: camp._id,
        evaluations: Object.values(evaluations).map(evaluation => ({
          ...evaluation,
          isCompleted: true,
          submittedAt: new Date().toISOString()
        }))
      };

      if (isOnline) {
        await apiService.submitEvaluation(submissionData);
        toast.success('Đã nộp đánh giá thành công!');
      } else {
        localStorageService.setItem(`submitted_evaluation_${leader._id}`, {
          ...submissionData,
          needsSync: true
        });
        toast.success('Đã lưu đánh giá offline - sẽ đồng bộ khi có mạng');
      }

      // Chuyển đến trang leaderboard
      setTimeout(() => {
        navigate('/leaderboard');
      }, 2000);

    } catch (error) {
      console.error('Lỗi submit đánh giá:', error);
      toast.error('Không thể nộp đánh giá. Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải form đánh giá..." />;
  }

  const progress = calculateProgress();

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderInfo>
            <h1>Đánh giá trẻ em - {leader.name}</h1>
            <p>{camp.name} • {subcamp.name} • {kids.length} trẻ em</p>
          </HeaderInfo>

          <StatusIndicator>
            <Status online={isOnline}>
              {isOnline ? <FaWifi /> : <FaTimes />}
              {isOnline ? 'Đã kết nối' : 'Offline'}
            </Status>

            {saveStatus.lastSaved && (
              <SaveStatus>
                <FaCheck />
                Lưu lần cuối: {getFormattedLastSaveTime()}
              </SaveStatus>
            )}
          </StatusIndicator>
        </HeaderContent>
      </Header>

      {/* Kids Overview */}
      <KidsOverview>
        <h2>Trẻ em được phân công ({kids.length})</h2>
        <KidsGrid>
          {kids.map(kid => (
            <KidCard key={kid._id}>
              <FaChild size={24} />
              <h4>{kid.name}</h4>
              <p>{kid.age} tuổi • {kid.nationality}</p>
            </KidCard>
          ))}
        </KidsGrid>
      </KidsOverview>

      {/* Progress */}
      <ProgressContainer>
        <h3>Tiến độ đánh giá: {progress}%</h3>
        <ProgressBar>
          <ProgressFill percentage={progress} />
        </ProgressBar>
        <p>{Object.values(evaluations).filter(e => e.rating > 0).length} / {kids.length * questions.length} câu hỏi đã hoàn thành</p>
      </ProgressContainer>

      {/* Questions */}
      <QuestionsContainer>
        {questions.map(question => (
          <QuestionCard key={question._id}>
            <QuestionTitle>
              <FaStar />
              {question.text}
            </QuestionTitle>

            <EvaluationGrid>
              {kids.map(kid => {
                const evaluationKey = `${leader._id}_${kid._id}_${question._id}`;
                const evaluation = evaluations[evaluationKey] || {};

                return (
                  <KidEvaluation key={kid._id}>
                    <KidName>
                      <FaChild />
                      {kid.name}
                    </KidName>

                    <RatingContainer>
                      <RatingLabel>Đánh giá (1-5 sao):</RatingLabel>
                      <StarRating>
                        {[1, 2, 3, 4, 5].map(rating => (
                          <Star
                            key={rating}
                            type="button"
                            filled={evaluation.rating >= rating}
                            onClick={() => updateRating(kid._id, question._id, rating)}
                          >
                            <FaStar />
                          </Star>
                        ))}
                      </StarRating>
                    </RatingContainer>

                    <CommentTextarea
                      placeholder="Nhận xét thêm (tùy chọn)..."
                      value={evaluation.comment || ''}
                      onChange={(e) => updateComment(kid._id, question._id, e.target.value)}
                    />
                  </KidEvaluation>
                );
              })}
            </EvaluationGrid>
          </QuestionCard>
        ))}
      </QuestionsContainer>

      {/* Action Buttons */}
      <ActionButtons>
        <SaveButton 
          onClick={handleManualSave}
          disabled={saveStatus.isSaving}
        >
          <FaSave />
          {saveStatus.isSaving ? 'Đang lưu...' : 'Lưu thủ công'}
        </SaveButton>

        <SubmitButton 
          onClick={handleSubmit}
          disabled={!canSubmit() || submitting}
        >
          <FaCheck />
          {submitting ? 'Đang nộp...' : 'Nộp đánh giá'}
        </SubmitButton>
      </ActionButtons>
    </Container>
  );
}

export default EvaluationForm;
