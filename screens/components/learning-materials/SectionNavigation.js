import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { COLORS } from './constants';

/**
 * SectionNavigation - Navigation controls for moving between sections
 * Can be displayed as header (compact) or footer (full buttons)
 */
export default function SectionNavigation({ 
  currentSection, 
  totalSections, 
  sectionTitle,
  onPrevious, 
  onNext,
  variant = 'header' // 'header' or 'footer'
}) {
  if (variant === 'footer') {
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          onClick={onPrevious} 
          disabled={currentSection === 1} 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
        >
          Previous Section
        </Button>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Section {currentSection} of {totalSections}
        </Typography>
        <Button 
          onClick={onNext} 
          disabled={currentSection === totalSections} 
          variant="contained" 
          endIcon={<ArrowForwardIcon />} 
          sx={{ 
            backgroundColor: COLORS.brand, 
            color: COLORS.dark, 
            boxShadow: 'none', 
            '&:hover': { backgroundColor: COLORS.brandHover, boxShadow: 'none' } 
          }}
        >
          Next Section
        </Button>
      </Box>
    );
  }

  // Header variant (compact)
  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h6" sx={{ color: COLORS.text }}>
        Section {currentSection} of {totalSections}: {sectionTitle}
      </Typography>
      <Box>
        <Button 
          onClick={onPrevious} 
          disabled={currentSection === 1} 
          sx={{ mr: 1 }} 
          startIcon={<ArrowBackIcon />}
        >
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={currentSection === totalSections} 
          endIcon={<ArrowForwardIcon />}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

