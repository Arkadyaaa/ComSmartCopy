import React from 'react';
import { Paper, Typography, Divider, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { COLORS } from './constants';

/**
 * TableOfContents - Displays a clickable list of all sections in the chapter
 */
export default function TableOfContents({ sections, currentSection, onSectionSelect }) {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, border: `1px solid ${COLORS.divider}`, borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: COLORS.text, fontSize: '0.9rem' }}>
        Table of Contents
      </Typography>
      <List dense sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {sections.map((section, idx) => (
          <ListItem 
            key={idx} 
            disablePadding
            sx={{ 
              borderRadius: 1,
              backgroundColor: idx + 1 === currentSection ? `${COLORS.brand}20` : 'transparent',
              border: idx + 1 === currentSection ? `1px solid ${COLORS.brand}` : '1px solid transparent',
            }}
          >
            <ListItemButton 
              selected={idx + 1 === currentSection} 
              onClick={() => onSectionSelect(idx + 1)} 
              sx={{ 
                borderRadius: 1,
                py: 1,
                '&:hover': { backgroundColor: `${COLORS.brand}10` },
                '&.Mui-selected': { backgroundColor: 'transparent' }
              }}
            >
              <ListItemText 
                primary={`${idx + 1}. ${section.title}`} 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: idx + 1 === currentSection ? 'bold' : 'normal',
                  color: idx + 1 === currentSection ? COLORS.brand : COLORS.text
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

