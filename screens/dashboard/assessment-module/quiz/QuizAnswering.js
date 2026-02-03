import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { getQuizzesByUser, submitQuiz, getUserQuizSubmission, saveSummativeAssessment, getSummativeAssessment } from '../../../../services/apiQuiz';
import SidebarLayout from '../../SidebarLayout';
import AssessmentPreview from './AssessmentPreview';
import TosTable from './tosTable';
import AssessmentOverview from './assessmentOverview';
import RecommendationModal from './recommendationModal';
import { fetchRecommendations } from '../../../../services/learningRecommendation';

export default function QuizAnswering({ route, navigation }) {
  const { userId, chapter, quizType, user, assessmentType } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [showTosModal, setShowTosModal] = useState(false);
  const [assessmentAccepted, setAssessmentAccepted] = useState(false);
  const [tosTab, setTosTab] = useState('overview'); 
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [formativeQuizzes, setFormativeQuizzes] = useState([]);

  // --- Logic Helpers ---

  const validateAnswers = (quizData, userAnswers) => {
    return quizData.map((q, idx) => {
      let isCorrect = false;
      if (q.type === 'multiple') {
        const correctIndex = typeof q.answer === 'string' ? 
          q.answer.toLowerCase().charCodeAt(0) - 97 : 
          parseInt(q.answer);
        isCorrect = correctIndex === parseInt(userAnswers[idx]);
      } else if (q.type === 'truefalse') {
        isCorrect = q.answer.toString().toUpperCase() === userAnswers[idx]?.toString().toUpperCase();
      } else if (q.type === 'fill') {
        const correctAnswer = q.answer.toString().trim().toLowerCase();
        const userAnswer = userAnswers[idx]?.toString().trim().toLowerCase() || '';
        isCorrect = correctAnswer === userAnswer;
      }
      return isCorrect;
    });
  };

  const handleRecommendation = async () => {
    try {
      setRecommendLoading(true);
      const incorrectQuery = quiz.quiz_data
        .filter((_, idx) => !results[idx])
        .map(q => q.question)
        .join(' ');

      const data = await fetchRecommendations({
        query: incorrectQuery || 'pc assembly components',
        limit: 5,
      });

      setRecommendations(data.videos || []);
      setShowRecommendModal(true);
    } catch (err) {
      Alert.alert('Error', 'Unable to load recommendations');
    } finally {
      setRecommendLoading(false);
    }
  };

  // --- Effects ---

  useEffect(() => {
    if (!userId) {
      Alert.alert('Session Error', 'User session not found.');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    async function fetchQuiz() {
      setLoading(true);
      try {
        const quizzes = await getQuizzesByUser(userId);
        const formative = quizzes.filter(q => ['pre-test', 'post-test'].includes(q.quiz_type));
        setFormativeQuizzes(formative);

        if (assessmentType === 'summative') {
          const existingSummative = await getSummativeAssessment(userId);
          if (existingSummative) {
            setQuiz(existingSummative);
            setAssessmentAccepted(true);
            const existingSubmission = await getUserQuizSubmission(existingSummative.id, userId, assessmentType);
            if (existingSubmission) {
              setAnswers(existingSubmission.answers);
              setSubmitted(true);
              setResults(validateAnswers(existingSummative.quiz_data, existingSubmission.answers));
            }
          } else {
             const response = await fetch('http://localhost:5000/api/generate-summative-assessment');
             const assessmentData = await response.json();
             const transformedQuiz = {
                id: assessmentData.metadata.id,
                title: assessmentData.metadata.title,
                quiz_type: 'summative',
                quiz_data: assessmentData.questions,
                metadata: assessmentData.metadata
             };
             setQuiz(transformedQuiz);
             setAssessmentAccepted(false);
          }
        } else {
          const found = quizzes.find(q => q.quiz_type === `chapter${chapter}` || q.quiz_type === chapter || q.quiz_type === quizType);
          if (found) {
            setQuiz(found);
            const existingSubmission = await getUserQuizSubmission(found.id, userId, assessmentType);
            if (existingSubmission) {
              setAnswers(existingSubmission.answers);
              setSubmitted(true);
              setResults(validateAnswers(found.quiz_data, existingSubmission.answers));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [userId, chapter, quizType, assessmentType]);

  // --- Handlers ---

  const handleAnswer = (idx, value) => {
    setAnswers({ ...answers, [idx]: value });
  };

  const handleAcceptAssessment = async () => {
    try {
      await saveSummativeAssessment({
        metadata: quiz.metadata || { id: quiz.id, title: quiz.title, assessment_type: 'summative' },
        questions: quiz.quiz_data
      }, userId);
      setAssessmentAccepted(true);
      setShowTosModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to accept assessment.');
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      Alert.alert('Warning', 'Please answer at least one question.');
      return;
    }

    const questionResults = validateAnswers(quiz.quiz_data, answers);
    const score = (questionResults.filter(r => r).length / quiz.quiz_data.length) * 100;

    try {
      await submitQuiz({
        quizId: quiz.id,
        userId: userId,
        answers: answers,
        score: Math.round(score),
        assessmentType: assessmentType
      });
      setResults(questionResults);
      setSubmitted(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit.');
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResults([]);
    setSubmitted(false);
  };

  const getQuestionStyle = (idx) => {
    // PRE-TEST: Never show green/red background
    if (!submitted || assessmentType === 'pre-test') return styles.questionCard;
    return {
      ...styles.questionCard,
      backgroundColor: results[idx] ? '#e6ffe6' : '#ffe6e6'
    };
  };

  if (loading) return <SidebarLayout><Text style={{margin: 40}}>Loading assessment...</Text></SidebarLayout>;
  if (!quiz) return <SidebarLayout><Text style={{margin: 40}}>No assessment found.</Text></SidebarLayout>;

  // --- Render Summative Intro ---
  if (assessmentType === 'summative' && !assessmentAccepted) {
    return (
      <SidebarLayout activeTab="Assessment" user={user || { id: userId }}>
        <View style={styles.container}>
          <View style={styles.headerRow}><Text style={styles.title}>{quiz.title}</Text></View>
          <ScrollView style={styles.scroll}><AssessmentOverview quiz={quiz} /></ScrollView>
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.viewTosBtn} onPress={() => setShowTosModal(true)}>
              <Text style={styles.viewTosBtnText}>View ToS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptAssessment}>
              <Text style={styles.acceptBtnText}>Accept Assessment</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showTosModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, tosTab === 'overview' && styles.tabActive]} onPress={() => setTosTab('overview')}>
                  <Text style={[styles.tabText, tosTab === 'overview' && styles.tabTextActive]}>Table of Specifications</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, tosTab === 'preview' && styles.tabActive]} onPress={() => setTosTab('preview')}>
                  <Text style={[styles.tabText, tosTab === 'preview' && styles.tabTextActive]}>Question Preview</Text>
                </TouchableOpacity>
              </View>
              {tosTab === 'overview' ? (
                <ScrollView style={styles.modalScroll}><TosTable questions={quiz.quiz_data} formativeQuizzes={formativeQuizzes} /></ScrollView>
              ) : (
                <AssessmentPreview quiz={quiz} />
              )}
              <TouchableOpacity style={styles.tosAcceptBtn} onPress={() => setShowTosModal(false)}>
                <Text style={styles.tosAcceptBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SidebarLayout>
    );
  }

  // --- Main Assessment View ---
  return (
    <SidebarLayout activeTab="Assessment" user={user || { id: userId }}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{quiz.title}</Text>
          {/* REMOVED RETAKE FOR PRE-TEST */}
          {submitted && assessmentType !== 'pre-test' && (
            <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
              <Text style={styles.retakeBtnText}>Retake Assessment</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scroll}>
          {(quiz.quiz_data || []).map((q, idx) => (
            <View key={idx} style={getQuestionStyle(idx)}>
              <Text style={styles.questionNumber}>Question {idx + 1}</Text>
              <Text style={styles.questionText}>{q.question}</Text>
              
              {q.type === 'multiple' && (
                <View style={styles.choicesList}>
                  {(q.choices || []).map((choice, cIdx) => (
                    <TouchableOpacity
                      key={cIdx}
                      style={[
                        styles.choiceBtn,
                        answers[idx] === cIdx && styles.choiceBtnSelected,
                        // REMOVED CORRECT/INCORRECT HIGHLIGHT FOR PRE-TEST
                        submitted && assessmentType !== 'pre-test' && q.answer == cIdx && styles.choiceBtnCorrect,
                        submitted && assessmentType !== 'pre-test' && answers[idx] === cIdx && !results[idx] && styles.choiceBtnIncorrect,
                      ]}
                      onPress={() => !submitted && handleAnswer(idx, cIdx)}
                      disabled={submitted}
                    >
                      <Text style={styles.choiceText}>{String.fromCharCode(65 + cIdx)}. {choice}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {q.type === 'truefalse' && (
                <View style={styles.choicesList}>
                  {['TRUE', 'FALSE'].map(val => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.choiceBtn,
                        answers[idx] === val && styles.choiceBtnSelected,
                        // REMOVED CORRECT/INCORRECT HIGHLIGHT FOR PRE-TEST
                        submitted && assessmentType !== 'pre-test' && q.answer.toString().toUpperCase() === val.toString().toUpperCase() && styles.choiceBtnCorrect,
                        submitted && assessmentType !== 'pre-test' && answers[idx] === val && !results[idx] && styles.choiceBtnIncorrect,
                      ]}
                      onPress={() => !submitted && handleAnswer(idx, val)}
                      disabled={submitted}
                    >
                      <Text style={styles.choiceText}>{val}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {q.type === 'fill' && (
                <TextInput
                  style={styles.input}
                  value={answers[idx] || ''}
                  onChangeText={v => !submitted && handleAnswer(idx, v)}
                  editable={!submitted}
                />
              )}

              {/* REMOVED FEEDBACK TEXT FOR PRE-TEST */}
              {submitted && assessmentType !== 'pre-test' && (
                <Text style={results[idx] ? styles.correctText : styles.incorrectText}>
                  {results[idx] ? 'Correct!' : ` Correct: ${q.type === 'multiple' ? q.choices[q.answer] : q.answer}`}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footerRow}>
          {!submitted ? (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Submit Assessment</Text>
            </TouchableOpacity>
          ) : (
            // REMOVED SCORE CONTAINER FOR PRE-TEST
            assessmentType !== 'pre-test' && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsText}>
                  Score: {((results.filter(r => r).length / results.length) * 100).toFixed(0)}%
                </Text>
              </View>
            )
          )}

          <TouchableOpacity
            style={styles.returnBtn}
            onPress={() => navigation.navigate('LearningMaterials', { chapterNumber: chapter === 'summative' ? 4 : chapter, user })}
          >
            <Text style={styles.returnBtnText}>Return</Text>
          </TouchableOpacity>

          {submitted && assessmentType === 'post-test' && (
            <TouchableOpacity style={styles.recommendBtn} onPress={handleRecommendation}>
              <Text style={styles.recommendBtnText}>Recommendation</Text>
            </TouchableOpacity>
          )}
        </View>

        <RecommendationModal
          visible={showRecommendModal}
          onClose={() => setShowRecommendModal(false)}
          loading={recommendLoading}
          videos={recommendations}
        />
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  scroll: {
    marginBottom: 100,
  },
  tosContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  tosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  tosSubheading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  tosText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    padding: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  closeBtnText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#EEE',
    backgroundColor: '#FAFAFA',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1976D2',
    backgroundColor: '#F5F5F5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#1976D2',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  tosAcceptBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  tosAcceptBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  choicesList: {
    marginLeft: 8,
  },
  choiceBtn: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  choiceBtnSelected: {
    backgroundColor: '#2196F3',
  },
  choiceBtnCorrect: {
    backgroundColor: '#4CAF50',
  },
  choiceBtnIncorrect: {
    backgroundColor: '#f44336',
  },
  choiceText: {
    fontSize: 16,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    color: '#222',
    marginBottom: 8,
  },
  submitBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    flex: 1,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewTosBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  viewTosBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  retakeBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsContainer: {
    backgroundColor: '#FFD305',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  resultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    gap: 12,
  },
  returnBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  returnBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  correctText: {
    color: '#008000',
    fontWeight: 'bold',
    marginTop: 8,
  },
  incorrectText: {
    color: '#ff0000',
    fontWeight: 'bold',
    marginTop: 8,
  },
  answerKeyText: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  recommendBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  recommendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center', 
    position: 'absolute', 
    bottom: 24, 
    left: 24, 
    right: 24, 
    gap: 12 
  },
});
