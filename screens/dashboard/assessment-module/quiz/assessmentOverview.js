import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AssessmentOverview({ quiz }) {
  if (!quiz) return null;

  const metadata = quiz.metadata || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assessment Overview</Text>

      <Text style={styles.description}>
        You are about to take the Comprehensive Summative Assessment. 
        This assessment evaluates your knowledge across all chapters.
      </Text>

      <Text style={styles.subheading}>Assessment Details:</Text>
      <Text style={styles.text}>
        • Total Questions: {metadata.total_questions ?? quiz.quiz_data?.length ?? 'N/A'}
        {'\n'}• Estimated Duration: {metadata.estimated_duration_hours ?? 'N/A'} hours
        {'\n'}• Assessment Type: {metadata.assessment_type ?? 'Unified'}
        {'\n'}• Chapters Covered: {metadata.chapters_included?.join(', ') || 'chapter1, chapter2, chapter3'}
      </Text>

      <Text style={styles.subheading}>Instructions:</Text>
      <Text style={styles.text}>
        • Read each question carefully{'\n'}
        • Select your answer for multiple choice questions{'\n'}
        • Fill in your answers for fill-in-the-blank questions{'\n'}
        • Submit when you have completed all questions{'\n'}
        • Review correct answers after submission
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
});
