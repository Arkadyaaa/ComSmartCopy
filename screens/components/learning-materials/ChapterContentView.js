import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Divider, Button, LinearProgress, Stack, Breadcrumbs, Link, Chip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { COLORS } from './constants';
import ProgressIndicator from './ProgressIndicator';
import SectionNavigation from './SectionNavigation';
import TableOfContents from './TableOfContents';
import ContentRenderer from './ContentRenderer';
import ChapterNavigation from './ChapterNavigation';
import FacilitatorModal from './FacilitatorModal';

export default function ChapterContentView({
  chapterNumber,
  currentChapter,
  currentSection,
  totalSections,
  user,
  stepChecks,
  onToggleStep,
  onPreviousSection,
  onNextSection,
  onSectionSelect,
  tutorUploadProps,
}) {
  const [openResources, setOpenResources] = useState(false);
  // Safety check: ensure currentSection is valid
  if (!currentChapter || !currentChapter.sections || currentSection < 1 || currentSection > totalSections) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5, mb: 6 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <Typography variant="h5" sx={{ color: COLORS.textMuted }}>
            Section not found.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const currentSectionData = currentChapter.sections[currentSection - 1];
  
  if (!currentSectionData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5, mb: 6 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <Typography variant="h5" sx={{ color: COLORS.textMuted }}>
            Section data not available.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const progressPercentage = Math.round((currentSection / totalSections) * 100);

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 6, px: { xs: 2, sm: 3 } }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs sx={{ mb: 3, color: COLORS.textMuted }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', '&:hover': { color: COLORS.brand } }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Dashboard
        </Link>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSectionSelect(0);
          }}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', '&:hover': { color: COLORS.brand } }}
        >
          <MenuBookIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Chapter {chapterNumber}
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          Section {currentSection}
        </Typography>
      </Breadcrumbs>

      {/* Tutor Upload Section */}
      {tutorUploadProps?.isTutor && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 3, 
            mb: 4,
            border: `1px solid ${COLORS.brand}20`
          }}
        >
          <Box sx={{ mt: 2 }}>
            {tutorUploadProps.loading ? (
              <LinearProgress sx={{ borderRadius: 1 }} />
            ) : (tutorUploadProps.materials || []).length === 0 ? (
              <Typography variant="body2" sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>
                No materials uploaded yet for this chapter.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {tutorUploadProps.materials.map((item) => (
                  <Box 
                    key={item.id} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1.5,
                      backgroundColor: 'white',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: COLORS.text, fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Chip 
                      label={item.type?.toUpperCase() || 'FILE'} 
                      size="small"
                      sx={{ 
                        backgroundColor: COLORS.brand,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>
      )}

      {/* Chapter Header with Progress */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          mb: 4,
          background: `linear-gradient(135deg, ${COLORS.brand} 0%, ${COLORS.brandHover} 100%)`,
          borderRadius: 3,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block', 
                mb: 1, 
                opacity: 0.9,
                fontWeight: 'bold',
                letterSpacing: 1.5
              }}
            >
              CHAPTER {chapterNumber}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                lineHeight: 1.2
              }}
            >
              {currentSectionData.title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Section {currentSection} of {totalSections} • {currentChapter.title}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {progressPercentage}%
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Complete
            </Typography>
          </Box>
        </Box>
        
        {/* Progress Bar */}
        <Box sx={{ mt: 3 }}>
          <ProgressIndicator 
            currentSection={currentSection} 
            totalSections={totalSections} 
          />
        </Box>
      </Paper>

      {/* Table of Contents - Collapsible */}
      <Box sx={{ mb: 4 }}>
        <TableOfContents
          sections={currentChapter.sections}
          currentSection={currentSection}
          onSectionSelect={onSectionSelect}
        />
      </Box>

      {/* Main Content Card */}
      <Paper 
        elevation={2}
        sx={{ 
          p: { xs: 3, md: 5 }, 
          backgroundColor: COLORS.card, 
          borderRadius: 3, 
          mb: 4,
          border: '1px solid #e8e8e8'
        }}
      >
        <ContentRenderer
          content={currentSectionData.content}
          sectionIndex={currentSection}
          stepChecks={stepChecks}
          onToggleStep={onToggleStep}
          user={user}
          onUploadClick={tutorUploadProps?.onOpenUploadModal || (() => {})}
        />
      </Paper>

      {/* Navigation Footer */}
      <Paper 
        elevation={1}
        sx={{ 
          p: 3, 
          borderRadius: 3,
          backgroundColor: '#f8f9fa',
          mb: 4
        }}
      >
        <SectionNavigation
          currentSection={currentSection}
          totalSections={totalSections}
          sectionTitle={currentSectionData.title}
          onPrevious={onPreviousSection}
          onNext={onNextSection}
          variant="footer"
        />
      </Paper>

      {/* --- TUTOR RESOURCES (Centered for everyone) --- */}
      <Box 
        sx={{ 
          mt: 6, 
          mb: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center' 
        }}
      >
        <Divider sx={{ width: '100%', mb: 4 }} />
        
        <Box sx={{ px: 2, py: 3, border: `1px dashed ${COLORS.textMuted}`, borderRadius: 2, width: '100%', maxWidth: '600px' }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 1.5 }}>
            <MenuBookIcon sx={{ color: COLORS.brand }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.text }}>
              Tutor Resources
            </Typography>
          </Stack>
          
          <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 3 }}>
            Download supplemental materials, teacher guides, and Tutorials.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenResources(true)}
            >
              PDF Files
            </Button>
          </Stack>
        </Box>
      </Box>
      {/* ---------------------------------------------- */}

      <FacilitatorModal
        open={openResources}
        onClose={() => setOpenResources(false)}
        chapter={`Chapter ${chapterNumber}`}
      />

      {/* Chapter Navigation */}
      <Divider sx={{ my: 4 }} />
      <ChapterNavigation chapterNumber={chapterNumber} user={user} />
    </Container>
  );
}