import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import SidebarLayout from '../SidebarLayout';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { getQuizzesByUser } from '../../../services/apiQuiz';

/* =======================
   Helper Functions
======================= */

const getChapterLabel = (quiz) => {
  if (quiz.quiz_type === 'summative') return 'Summative';
  if (quiz.chapter === 4 || quiz.chapter === 'chapter4') return 'Optional';
  return 'Required';
};

const getScoresByType = (quiz, userId) => {
  const submissions = quiz.submissions || [];

  const pre = submissions.find(
    s => s.user_id === userId && s.assessment_type === 'pre-test'
  );

  const post = submissions.find(
    s => s.user_id === userId && s.assessment_type === 'post-test'
  );

  const summative = submissions.find(
    s => s.user_id === userId && s.assessment_type === 'summative'
  );

  return { pre, post, summative };
};

/* =======================
   Component
======================= */

export default function AssessmentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const user = route.params?.user;

  const [deployedQuizzes, setDeployedQuizzes] = useState([]);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        if (!user?.id) {
          setDeployedQuizzes([]);
          return;
        }

        const quizzes = await getQuizzesByUser(user.id);

        const mapped = (quizzes || []).map(q => ({
          id: q.id,
          title: q.title,
          chapter: q.chapter,
          quiz_type: q.quiz_type,
          questions: q.quiz_data,
          createdAt: q.created_at,
          submissions: q.quiz_submission || [],
        }));

        setDeployedQuizzes(mapped);
      } catch (error) {
        console.error('Error loading quizzes:', error);
        setDeployedQuizzes([]);
      }
    };

    loadQuizzes();
  }, [user?.id, isFocused]);

  if (!user?.id) {
    return (
      <SidebarLayout activeTab="Assessment" user={user}>
        <View style={styles.outerContainer}>
          <Text>User session not found.</Text>
        </View>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outerContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.cardsWrapper}>
            {deployedQuizzes.map((quiz) => {
              // LOGIC MOVED INSIDE THE MAP
              const { pre, post, summative } = getScoresByType(quiz, user.id);
              const totalQuestions = quiz.questions?.length || 0;

              return (
                <View key={quiz.id} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('QuizScreen', { user, quiz })}
                  >
                    {/* LEFT: Title and Question Count */}
                    <View style={styles.cardLeft}>
                      <Text style={styles.cardTitle}>{quiz.title}</Text>
                      <Text style={styles.cardSubtitle}>
                        {totalQuestions} Questions
                      </Text>
                    </View>

                    {/* MID: Label (Required/Summative) */}
                    <View style={styles.cardMid}>
                      <Text style={styles.cardPrerequisite}>{getChapterLabel(quiz)}</Text>
                    </View>

                    {/* RIGHT: Scores */}
                    <View style={styles.cardMid}>
                      {quiz.quiz_type === 'summative' ? (
                        <Text style={styles.cardProgress}>
                          Score: {summative?.score ?? 0}/{totalQuestions}
                        </Text>
                      ) : (
                        <>
                          <Text style={styles.cardProgress}>
                            Pre-test: {pre?.score ?? 0}/{totalQuestions}
                          </Text>
                          <Text style={styles.cardProgress}>
                            Post-test: {post?.score ?? 0}/{totalQuestions}
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardsWrapper: {
    width: '100%',
    minWidth: 1500,
    maxWidth: 1500,
    alignSelf: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    width: '100%',
    height: 120,
  },
  cardLeft: {
    flex: 2,
    paddingLeft: 18,
    justifyContent: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#444',
  },
  cardMid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPrerequisite: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardProgress: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
});