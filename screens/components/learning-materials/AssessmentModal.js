// formative post-test = 75%
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, Alert } from '@mui/material';
import { useNavigation } from '@react-navigation/native';
import { getUserQuizSubmission, getQuizzesByUser, saveQuiz } from '../../../services/apiQuiz';
import { generateFormativeAssessment } from '../assessment/AssessmentGeneration';


export default function AssessmentModal({ open, onClose, user, chapterNumber }) {
  const navigation = useNavigation();
  const [preTestSubmission, setPreTestSubmission] = useState(null);
  const [previousPostTestScore, setPreviousPostTestScore] = useState(null);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [previousQuizId, setPreviousQuizId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingAssessment, setGeneratingAssessment] = useState(false);

  useEffect(() => {
    if (open && user?.id) {
      checkProgressionRequirements();
    }
  }, [open, user?.id, chapterNumber]);

  const checkProgressionRequirements = async () => {
    setLoading(true);
    try {
      const quizzes = await getQuizzesByUser(user.id);
      
      let currentChapterQuiz = quizzes.find(q => q.quiz_type === `chapter${chapterNumber}`);
      
      if (!currentChapterQuiz) {
        setGeneratingAssessment(true);
        const generatedQuiz = await generateFormativeAssessment(chapterNumber, user.id);
        currentChapterQuiz = generatedQuiz;
        setGeneratingAssessment(false);
      }

      if (currentChapterQuiz) {
        setCurrentQuizId(currentChapterQuiz.id);
        
        const preTestData = await getUserQuizSubmission(currentChapterQuiz.id, user.id, 'pre-test');
        setPreTestSubmission(preTestData);
      }

      if (chapterNumber > 1) {
        const previousChapter = chapterNumber - 1;
        const previousChapterQuiz = quizzes.find(q => q.quiz_type === `chapter${previousChapter}`);
        if (previousChapterQuiz) {
          setPreviousQuizId(previousChapterQuiz.id);
          const postTestData = await getUserQuizSubmission(previousChapterQuiz.id, user.id, 'post-test');
          if (postTestData) {
            setPreviousPostTestScore(postTestData.score);
          }
        }
      }
    } catch (error) {
      console.error('Error checking progression:', error);
      Alert.alert('Error', 'Failed to load assessment requirements');
    } finally {
      setLoading(false);
    }
  };

  const canTakePreTest = () => {
    if (chapterNumber === 1) return true;
    return previousPostTestScore !== null && previousPostTestScore >= 75;
  };

  const canTakePostTest = () => {
    return preTestSubmission !== null;
  };

  const handleQuizNavigation = (assessmentType) => {
    if (!user || !user.id) {
      Alert.alert('Error', 'Please login again to take the assessment.');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    if (assessmentType === 'pre-test' && !canTakePreTest()) {
      Alert.alert('Progression Required', 'Complete the previous chapter requirements');
      return;
    }

    if (assessmentType === 'post-test' && !canTakePostTest()) {
      Alert.alert('Pre-Test Required', 'Complete the chapter pre-test to continue');
      return;
    }

    onClose();
    navigation.navigate('QuizAnswering', { 
      userId: user.id, 
      user, 
      chapter: chapterNumber, 
      assessmentType,
      quizId: currentQuizId
    });
  };

  if (loading || generatingAssessment) {
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          bgcolor: 'background.paper', 
          boxShadow: 24, 
          p: 4, 
          borderRadius: 2, 
          minWidth: 300, 
          textAlign: 'center' 
        }}>
          <Typography>{generatingAssessment ? 'Generating assessment...' : 'Loading assessment requirements...'}</Typography>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        bgcolor: 'background.paper', 
        boxShadow: 24, 
        p: 4, 
        borderRadius: 2, 
        minWidth: 300, 
        textAlign: 'center' 
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Select Assessment Type</Typography>
        
        <Button 
          variant="contained" 
          sx={{ mb: 2, width: '100%' }}
          disabled={!canTakePreTest()}
          onClick={() => handleQuizNavigation('pre-test')}
        >
          Pre-Test
          {chapterNumber > 1 && !canTakePreTest() && (
            <Typography sx={{ fontSize: '0.75rem', display: 'block', mt: 0.5 }}>
              (Requires 75% on Ch. {chapterNumber - 1} Post-Test)
            </Typography>
          )}
        </Button>

        <Button 
          variant="contained" 
          color="secondary" 
          sx={{ width: '100%' }}
          disabled={!canTakePostTest()}
          onClick={() => handleQuizNavigation('post-test')}
        >
          Post-Test
          {!canTakePostTest() && (
            <Typography sx={{ fontSize: '0.75rem', display: 'block', mt: 0.5 }}>
              (Complete Pre-Test first)
            </Typography>
          )}
        </Button>
      </Box>
    </Modal>
  );
}

