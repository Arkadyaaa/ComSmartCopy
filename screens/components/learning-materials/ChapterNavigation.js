import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from './constants';
import { useEffect, useState } from 'react';
import { getChapterPostTestSubmission  } from '../../../services/apiQuiz';

/**
 * ChapterNavigation - Navigation buttons for moving between chapters
 */
export default function ChapterNavigation({ chapterNumber, user }) {
  const navigation = useNavigation();
  const [canTakeSummative, setCanTakeSummative] = useState(false);
  const handleSummativeAssessment = () => {
    if (!canTakeSummative) {
      alert('You must pass the Chapter 3 Post-test with at least 75% to unlock the Summative Assessment.');
      return;
    }

    navigation.navigate('QuizAnswering', {
      userId: user.id,
      chapter: 'summative',
      quizType: 'summative',
      user,
      assessmentType: 'summative'
    });
  };


 useEffect(() => {
  async function checkEligibility() {
    if (!user?.id || chapterNumber !== 3) return;

    try {
      const postTest = await getChapterPostTestSubmission(
        user.id,
        'chapter3' 
      );

      if (!postTest) {
        setCanTakeSummative(false);
        return;
      }

      const score = postTest.score ?? 0;

      setCanTakeSummative(score >= 75);
    } catch (err) {
      console.error('Eligibility check failed:', err);
      setCanTakeSummative(false);
    }
  }

  checkEligibility();
}, [user, chapterNumber]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 2,
      }}
    >
      {/* 1. Previous Chapter Button */}
      {chapterNumber > 1 && (
        <Button
          variant="text"
          onClick={() => navigation.replace('LearningMaterials', {
            chapterNumber: chapterNumber - 1,
            user
          })}
          sx={{ color: COLORS.dark, '&:hover': { backgroundColor: '#5585b5' } }}
        >
          ← Chapter {chapterNumber - 1}
        </Button>
      )}

      {chapterNumber === 3 && (
        <Button
          variant="contained"
          disabled={!canTakeSummative}
          onClick={handleSummativeAssessment}
          sx={{
            backgroundColor: canTakeSummative ? '#FF5733' : '#ccc',
            color: '#fff',
            padding: '12px 36px',
            fontSize: '1rem',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: canTakeSummative ? '#C70039' : '#ccc'
            }
          }}
        >
          Summative Assessment
        </Button>
      )}
      {/* 3. Next Chapter Button */}
      {chapterNumber < 4 && (
        <Button
          variant="text"
          onClick={() => navigation.replace('LearningMaterials', {
            chapterNumber: chapterNumber + 1,
            user
          })}
          sx={{
            color: COLORS.dark,
            marginLeft: chapterNumber > 1 ? 'auto' : 0,
            '&:hover': { backgroundColor: '#5585b5' }
          }}
        >
          Chapter {chapterNumber + 1} →
        </Button>
      )}
    </Box>
  );
}