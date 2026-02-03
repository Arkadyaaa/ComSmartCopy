import React from 'react';
import { Box, Typography, Checkbox, Paper, Button } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { COLORS } from './constants';

/**
 * ContentRenderer - Renders different types of content lines:
 * - Numbered steps (with checkboxes)
 * - Bulleted lists
 * - Callout boxes (Warning, Tip, Note)
 * - Upload placeholders ([UPLOAD: image], [UPLOAD: video], [UPLOAD: pdf])
 * - Regular text
 */
export default function ContentRenderer({ 
  content, 
  sectionIndex, 
  stepChecks, 
  onToggleStep,
  user,
  onUploadClick
}) {
  const isStepLine = (line) => /^\d+\.\s/.test(line);
  const stripStepNumber = (line) => line.replace(/^\d+\.\s/, '');
  const getSectionKey = (sectionIndex, stepIndex) => `s${sectionIndex}-i${stepIndex}`;
  const isUploadPlaceholder = (line) => /^\[UPLOAD:\s*(image|video|pdf)\]/i.test(line);
  const getUploadType = (line) => {
    const match = line.match(/^\[UPLOAD:\s*(image|video|pdf)\]/i);
    return match ? match[1].toLowerCase() : null;
  };
  const getUploadLabel = (line) => {
    const match = line.match(/^\[UPLOAD:\s*(image|video|pdf)\]\s*(.*)/i);
    return match && match[2] ? match[2].trim() : null;
  };

  const renderUploadPlaceholder = (type, label, index) => {
    const isTutor = user?.userType === 'tutor';
    const icons = {
      image: ImageIcon,
      video: VideoLibraryIcon,
      pdf: PictureAsPdfIcon
    };
    const colors = {
      image: '#4CAF50',
      video: '#F44336',
      pdf: '#FF9800'
    };
    const Icon = icons[type] || CloudUploadIcon;
    const color = colors[type] || COLORS.brand;

    return (
      <Paper 
        key={index}
        elevation={2}
        sx={{ 
          mt: 2, 
          mb: 2, 
          p: 3, 
          border: `2px dashed ${color}`,
          backgroundColor: `${color}08`,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Icon sx={{ fontSize: 48, color: color, mb: 1 }} />
        <Typography variant="h6" sx={{ color: COLORS.text, fontWeight: 'bold', mb: 1 }}>
          {label || `Upload ${type.toUpperCase()} Material`}
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
          {type === 'image' && 'Upload an image file (PNG, JPG, JPEG)'}
          {type === 'video' && 'Upload a video file (MP4, MOV, AVI)'}
          {type === 'pdf' && 'Upload a PDF document'}
        </Typography>
        {isTutor && onUploadClick && (
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => onUploadClick(type, label)}
            sx={{
              backgroundColor: color,
              '&:hover': { backgroundColor: color, opacity: 0.9 }
            }}
          >
            Upload {type.toUpperCase()}
          </Button>
        )}
        {!isTutor && (
          <Typography variant="body2" sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>
            Material will be available here once uploaded by facilitator
          </Typography>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ 
      lineHeight: 1.8, 
      fontSize: '1.05rem',
      color: COLORS.text,
      '& > *': {
        transition: 'all 0.2s ease'
      }
    }}>
      {content.map((line, index) => {
        // Empty lines - reduced spacing
        if (line === '') return <Box key={index} sx={{ mb: 2 }} />;

        // Upload placeholders
        if (isUploadPlaceholder(line)) {
          const type = getUploadType(line);
          const label = getUploadLabel(line);
          return renderUploadPlaceholder(type, label, index);
        }

        // Checklist rendering for numbered steps (e.g., "1. Step text")
        if (isStepLine(line)) {
          const stepKey = getSectionKey(sectionIndex, index);
          const checked = !!stepChecks[stepKey];
          return (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: checked ? '#e8f5e9' : 'transparent',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: checked ? '#e8f5e9' : '#f5f5f5'
                }
              }}
            >
              <Checkbox 
                size="medium" 
                checked={checked} 
                onChange={() => onToggleStep(sectionIndex, index)} 
                sx={{ 
                  p: 0.5, 
                  mr: 2, 
                  mt: 0.5,
                  color: COLORS.brand, 
                  '&.Mui-checked': { 
                    color: COLORS.brand,
                    '& .MuiSvgIcon-root': {
                      fontSize: 28
                    }
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: 24
                  }
                }} 
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  color: COLORS.text, 
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  flex: 1,
                  textDecoration: checked ? 'line-through' : 'none',
                  opacity: checked ? 0.7 : 1
                }}
              >
                {stripStepNumber(line)}
              </Typography>
            </Box>
          );
        }

        // Bulleted lists (e.g., "• Item text")
        if (line.startsWith('•')) {
          return (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                mb: 1.5, 
                ml: 1,
                pl: 2
              }}
            >
              <CircleIcon 
                sx={{ 
                  fontSize: 8, 
                  color: COLORS.brand, 
                  mt: 1.5, 
                  mr: 2,
                  flexShrink: 0
                }} 
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  color: COLORS.text,
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  flex: 1
                }}
              >
                {line.substring(2)}
              </Typography>
            </Box>
          );
        }

        // Callout-styled subheaders (ending with ":")
        // Supports: Warning, Tip, Note
        if (line.endsWith(':')) {
          const isWarning = /^Warning:/i.test(line);
          const isTip = /^Tip:/i.test(line);
          const isNote = /^Note:/i.test(line);
          const isImportant = /^Important:/i.test(line);
          
          let bg, border, iconColor;
          if (isWarning) {
            bg = '#fff3cd';
            border = '#ffc107';
            iconColor = '#856404';
          } else if (isTip) {
            bg = '#d1ecf1';
            border = '#17a2b8';
            iconColor = '#0c5460';
          } else if (isNote) {
            bg = '#e7f3ff';
            border = '#2196F3';
            iconColor = '#0d47a1';
          } else if (isImportant) {
            bg = '#f8d7da';
            border = '#dc3545';
            iconColor = '#721c24';
          } else {
            bg = 'transparent';
            border = 'transparent';
            iconColor = COLORS.text;
          }
          
          return (
            <Box 
              key={index} 
              sx={{ 
                mt: 3, 
                mb: 2, 
                p: bg === 'transparent' ? 0 : 2, 
                backgroundColor: bg, 
                borderLeft: bg === 'transparent' ? 'none' : `5px solid ${border}`, 
                borderRadius: 2,
                boxShadow: bg !== 'transparent' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: iconColor, 
                  fontWeight: 'bold',
                  fontSize: '1.15rem',
                  mb: bg !== 'transparent' ? 0.5 : 0
                }}
              >
                {line}
              </Typography>
            </Box>
          );
        }

        // Check if line is a heading (all caps or starts with capital and ends with colon)
        const isHeading = /^[A-Z][A-Z\s]+:?$/.test(line) && line.length < 50;
        
        // Regular text - improved readability
        return (
          <Typography 
            key={index} 
            variant="body1" 
            sx={{ 
              mb: 2, 
              color: COLORS.text, 
              fontSize: isHeading ? '1.2rem' : '1.05rem',
              fontWeight: isHeading ? 'bold' : 'normal',
              lineHeight: 1.8,
              letterSpacing: isHeading ? 0.5 : 'normal'
            }}
          >
            {line}
          </Typography>
        );
      })}
    </Box>
  );
}

