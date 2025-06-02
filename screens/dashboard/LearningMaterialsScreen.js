import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { useRoute, useNavigation } from '@react-navigation/native';

import BookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';

import SidebarLayout from './SidebarLayout';

export default function LearningMaterialScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user;
  
  return (
    <SidebarLayout activeTab="Learning Materials" user={user}>
      <Container sx={{ mt: 5 }}>
        <Typography variant="h4" align="center" gutterBottom>
          CHAPTER 1: INTRODUCTION TO COMPUTER HARDWARE
        </Typography>

        <Grid container spacing={4} justifyContent="center" sx={{ mt: 4, mb: 6 }}>
          <Grid item>
            <Paper
              elevation={6}
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                width: 200, 
                cursor: 'pointer' 
              }}
              onClick={() => navigation.navigate('ViewLessonScreen', { user })}
            >
              <BookIcon sx={{ fontSize: 60 }} />
              <Typography fontWeight="bold" sx={{ mt: 1 }}>
                VIEW LESSON
              </Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper elevation={6} sx={{ p: 4, textAlign: 'center', width: 200 }}>
              <PersonIcon sx={{ fontSize: 60 }} />
              <Typography fontWeight="bold" sx={{ mt: 1 }}>
                FACILITATOR RESOURCES
              </Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper elevation={6} sx={{ p: 4, textAlign: 'center', width: 200 }}>
              <AssessmentIcon sx={{ fontSize: 60 }} />
              <Typography fontWeight="bold" sx={{ mt: 1 }}>
                GENERATE ASSESSMENT
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Rest of your code remains the same */}
        <Box
          sx={{
            backgroundColor: '#404040',
            color: '#fff',
            width: 250,
            mx: 'auto',
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ color: 'yellow' }}>
            QUIZ
          </Typography>
          <Typography>Chapter 1</Typography>
          <Typography variant="body2">
            Group Assessment (Sir Redington)<br />10 Items
          </Typography>
          <Typography
            variant="caption"
            align="right"
            sx={{ color: 'yellow', display: 'block', mt: 1 }}
          >
            4/20/2024 - 4/21/2024
          </Typography>
        </Box>
      </Container>
    </SidebarLayout>
  );
}