import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';



export default function AssessmentPreview({ quiz }) {
  if (!quiz || !quiz.quiz_data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No assessment data available.</Text>
      </View>
    );
  }
const questions = quiz.quiz_data;
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.previewTitle}>Question Preview</Text>

      {questions.map((q, idx) => (
        <View key={idx} style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            Question {idx + 1}
          </Text>

          <Text style={styles.questionText}>{q.question}</Text>

          <Text style={styles.metaText}>
            Bloom Level: {q.bloom || 'Knowledge'}
          </Text>

          {q.type === 'multiple' && (
            <View style={styles.choices}>
              {(q.choices || []).map((choice, i) => (
                <Text key={i} style={styles.choiceText}>
                  {String.fromCharCode(65 + i)}. {choice}
                </Text>
              ))}
            </View>
          )}

          {q.type === 'truefalse' && (
            <Text style={styles.choiceText}>TRUE / FALSE</Text>
          )}

          {q.type === 'fill' && (
            <Text style={styles.choiceText}>
              (Fill in the blank)
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  questionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  typeTag: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '600',
  },
  bloomTag: {
    backgroundColor: '#F3E5F5',
    color: '#7B1FA2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: 8,
    paddingLeft: 8,
  },
  option: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
    minWidth: 20,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  fillContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  fillText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  distributionRow: {
    paddingVertical: 6,
    paddingLeft: 12,
  },
  distributionLabel: {
    fontSize: 13,
    color: '#555',
  },
  spacing: {
    height: 20,
  },
  container: {
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  rowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  totalRow: {
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 8,
  },
  cell: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  cellHeader: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  questionCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
  },
  questionNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questionText: {
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 6,
  },
  choices: {
    marginTop: 6,
  },
  choiceText: {
    fontSize: 13,
    marginBottom: 2,
  },
});
