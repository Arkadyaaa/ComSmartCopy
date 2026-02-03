import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BookIcon from '@mui/icons-material/MenuBook';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';
import { COLORS, loadStorage } from './constants';
import ChapterNavigation from './ChapterNavigation';
import AssessmentModal from './AssessmentModal';

/**
 * ChapterStartView - The initial view when opening a chapter
 * Shows chapter title, description, image, and action buttons
 */
export default function ChapterStartView({ 
  chapterNumber, 
  currentChapter, 
  user, 
  onStartLearning,
  assessmentModalOpen,
  onAssessmentModalOpen,
  onAssessmentModalClose
}) {
  const navigation = useNavigation();
  
  // Safety checks
  if (!currentChapter) {
    return (
      <Container>
        <Typography>Chapter data not available</Typography>
      </Container>
    );
  }

  const resumeProgress = loadStorage(`lm:progress:chapter:${chapterNumber}`, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<HomeIcon />}
          onClick={() => navigation.goBack()}
          sx={{
            color: COLORS.textMuted,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              color: COLORS.brand
            }
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Chapter Header Card */}
      <Paper
        elevation={4}
        sx={{
          background: `linear-gradient(135deg, ${COLORS.brand} 0%, ${COLORS.brandHover} 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(20%, -20%)'
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              mb: 1,
              opacity: 0.9,
              fontWeight: 'bold',
              letterSpacing: 2,
              fontSize: '0.9rem'
            }}
          >
            CHAPTER {chapterNumber}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              lineHeight: 1.2,
              textTransform: 'uppercase',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}
          >
            {currentChapter.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              opacity: 0.95,
              maxWidth: '80%'
            }}
          >
            {currentChapter.description}
          </Typography>
        </Box>
      </Paper>

      {/* Main Content Card */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          mb: 4
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 400
        }}>
          {/* Left Panel - Content */}
          <Box sx={{
            flex: 1,
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#f8f9fa'
          }}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: COLORS.text,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' }
                }}
              >
                Ready to Learn?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: COLORS.textMuted,
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  mb: 3
                }}
              >
                This chapter contains {currentChapter.sections?.length || 0} comprehensive sections covering all aspects of {currentChapter.title.toLowerCase()}. 
                Follow along step-by-step and complete the interactive checklists as you progress.
              </Typography>

              {/* Section Preview */}
              {currentChapter.sections && currentChapter.sections.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: COLORS.text }}>
                    Sections in this chapter:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {currentChapter.sections.slice(0, 3).map((section, idx) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        sx={{
                          color: COLORS.textMuted,
                          pl: 2,
                          position: 'relative',
                          '&::before': {
                            content: '"•"',
                            position: 'absolute',
                            left: 0,
                            color: COLORS.brand,
                            fontWeight: 'bold'
                          }
                        }}
                      >
                        {section.title}
                      </Typography>
                    ))}
                    {currentChapter.sections.length > 3 && (
                      <Typography variant="body2" sx={{ color: COLORS.textMuted, pl: 2, fontStyle: 'italic' }}>
                        + {currentChapter.sections.length - 3} more sections
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<BookIcon />}
                onClick={() => onStartLearning(1)}
                sx={{
                  backgroundColor: COLORS.brand,
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  boxShadow: 3,
                  '&:hover': {
                    backgroundColor: COLORS.brandHover,
                    transform: 'translateY(-2px)',
                    boxShadow: 6
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Learning
              </Button>
              {resumeProgress > 0 && resumeProgress < (currentChapter.sections.length || 1) && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<BookIcon />}
                  onClick={() => onStartLearning(resumeProgress)}
                  sx={{
                    borderColor: COLORS.brand,
                    color: COLORS.brand,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: `${COLORS.brand}10`,
                      borderColor: COLORS.brandHover,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Resume Section {resumeProgress}
                </Button>
              )}
              <Button
                variant="outlined"
                size="large"
                startIcon={<AssessmentIcon />}
                onClick={onAssessmentModalOpen}
                sx={{
                  borderColor: COLORS.textMuted,
                  color: COLORS.text,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: COLORS.text,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Take Quiz
              </Button>
            </Box>
          </Box>

          {/* Right Panel - Chapter Image */}
          <Box sx={{
            flex: { xs: 'none', md: 1 },
            minHeight: { xs: 300, md: 'auto' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            p: 3,
            position: 'relative'
          }}>
            {currentChapter.image ? (
              <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <Image
                  source={currentChapter.image}
                  accessibilityLabel={`Chapter ${chapterNumber} image`}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                    borderRadius: 8
                  }}
                />
              </Box>
            ) : (
              <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 2
              }}>
                <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                  No image available
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Chapter Navigation */}
      <Box sx={{ mt: 3 }}>
        <ChapterNavigation chapterNumber={chapterNumber} user={user} />
      </Box>

      {/* Assessment Modal */}
      <AssessmentModal
        open={assessmentModalOpen}
        onClose={onAssessmentModalClose}
        user={user}
        chapterNumber={chapterNumber}
      />
    </Container>
  );
}
