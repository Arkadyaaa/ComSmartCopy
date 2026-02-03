import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { getUserQuizSubmission, getQuizzesByUser } from '../../../services/apiQuiz';

export default function AssessmentResults({ open, onClose, user, chapterNumber }) {
  const [preTestScore, setPreTestScore] = useState(null);
  const [postTestScore, setPostTestScore] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user?.id) {
      fetchAssessmentResults();
    }
  }, [open, user?.id, chapterNumber]);

  const fetchAssessmentResults = async () => {
    setLoading(true);
    try {
      const quizzes = await getQuizzesByUser(user.id);
      const quiz = quizzes.find(q => q.quiz_type === `chapter${chapterNumber}`);

      if (quiz) {
        const preTest = await getUserQuizSubmission(quiz.id, user.id, 'pre-test');
        const postTest = await getUserQuizSubmission(quiz.id, user.id, 'post-test');

        setPreTestScore(preTest?.score ?? null);
        setPostTestScore(postTest?.score ?? null);
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
    } finally {
      setLoading(false);
    }
  };

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
        minWidth: 350, 
        textAlign: 'center' 
      }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Chapter {chapterNumber} - Metrics
        </Typography>

        {loading ? (
          <Typography>Loading results...</Typography>
        ) : (
          <>
            <Box sx={{ 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              mb: 2,
              textAlign: 'left'
            }}>
              <Typography sx={{ mb: 1.5, fontSize: '16px' }}>
                <strong>Pre-test result:</strong> {preTestScore !== null ? `${preTestScore}%` : 'n/a'}
              </Typography>
              <Typography sx={{ fontSize: '16px' }}>
                <strong>Post-test result:</strong> {postTestScore !== null ? `${postTestScore}%` : 'n/a'}
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={onClose}
              sx={{ mt: 2, width: '100%' }}
            >
              Return
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}
