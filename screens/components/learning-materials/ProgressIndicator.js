import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { COLORS } from './constants';

/**
 * ProgressIndicator - Shows progress bar and percentage for section completion
 */
export default function ProgressIndicator({ currentSection, totalSections }) {
  const progress = Math.round((currentSection / totalSections) * 100);

  return (
    <Box sx={{ mb: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', flex: 1, mr: 2 }}>
          {Array.from({ length: totalSections }).map((_, index) => (
            <Box 
              key={index} 
              sx={{ 
                height: 6, 
                flex: 1, 
                backgroundColor: index < currentSection ? COLORS.brand : 'rgba(255,255,255,0.3)', 
                mr: index < totalSections - 1 ? 0.5 : 0, 
                borderRadius: 3,
                transition: 'background-color 0.3s ease',
                boxShadow: index < currentSection ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
              }} 
            />
          ))}
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            minWidth: 50,
            textAlign: 'right'
          }}
        >
          {progress}%
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
        {currentSection} of {totalSections} sections completed
      </Typography>
    </Box>
  );
}

