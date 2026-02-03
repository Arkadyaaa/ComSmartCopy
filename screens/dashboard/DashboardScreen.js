import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getRecords, getCurrentUser } from '../../services/apiRecords';
import { getQuizzesByUser, getUserQuizSubmission } from '../../services/apiQuiz';
import SidebarLayout from './SidebarLayout';
import AssessmentResults from '../components/dashboard/AssessmentResults';
import FacilitatorResourcesModal from '../components/dashboard/FacilitatorResourcesModal';

const SkeletonLoader = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonElement, styles.skeletonIcon]} />
      <View style={styles.skeletonInfo}>
        <View style={[styles.skeletonElement, styles.skeletonTitle]} />
        <View style={[styles.skeletonElement, styles.skeletonSubtitle]} />
      </View>
    </View>
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonElement, styles.skeletonIcon]} />
      <View style={styles.skeletonInfo}>
        <View style={[styles.skeletonElement, styles.skeletonTitle]} />
        <View style={[styles.skeletonElement, styles.skeletonSubtitle]} />
      </View>
    </View>
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonElement, styles.skeletonIcon]} />
      <View style={styles.skeletonInfo}>
        <View style={[styles.skeletonElement, styles.skeletonTitle]} />
        <View style={[styles.skeletonElement, styles.skeletonSubtitle]} />
      </View>
    </View>
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonElement, styles.skeletonIcon]} />
      <View style={styles.skeletonInfo}>
        <View style={[styles.skeletonElement, styles.skeletonTitle]} />
        <View style={[styles.skeletonElement, styles.skeletonSubtitle]} />
      </View>
    </View>
  </View>
);

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [currentQuote, setCurrentQuote] = useState('');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [resourcesModalOpen, setResourcesModalOpen] = useState(false);

  const motivationalQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "In the middle of difficulty lies opportunity. - Albert Einstein",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for."
  ];

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  };

  const baseChapters = [
  {
    number: 1,
    title: 'ASSEMBLE COMPUTER HARDWARE',
    icon: require('../../assets/part_icons/CPU.png'),
    optional: false,
  },
  {
    number: 2,
    title: 'DRIVER & OPERATING SYSTEMS INSTALLATION',
    icon: require('../../assets/part_icons/STORAGE.png'),
    optional: false,
  },
  {
    number: 3,
    title: 'APPLICATION SOFTWARE INSTALLATIONS',
    icon: require('../../assets/part_icons/MOBO.png'),
    optional: false,
  },
  {
    number: 4,
    title: 'PC TROUBLESHOOTING TECHNIQUES',
    icon: require('../../assets/part_icons/GPU.png'),
    optional: true, 
  },
];


  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        console.log('Current user:', currentUser);
        console.log('User type:', currentUser?.userType);
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Fallback to first user if getCurrentUser fails
        try {
          const records = await getRecords();
          if (records.length > 0) {
            setUser(records[0]);
            console.log('Fallback user:', records[0]);
          }
        } catch (fallbackError) {
          console.error('Error fetching fallback user:', fallbackError);
        }
      }
    }
    fetchUser();
    setCurrentQuote(getRandomQuote());
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchChapterProgress();
    }
  }, [user]);
// get the progress of each chapter for the user
  const fetchChapterProgress = async () => {
    setLoading(true);
    try {
      const quizzes = await getQuizzesByUser(user.id);
      
      const chaptersWithProgress = await Promise.all(
        baseChapters.map(async (chapter) => {
          const quiz = quizzes.find(q => q.quiz_type === `chapter${chapter.number}`);
          
          if (!quiz) {
            return { ...chapter, progress: 'Not Started' };
          }

          const preTest = await getUserQuizSubmission(quiz.id, user.id, 'pre-test');
          const postTest = await getUserQuizSubmission(quiz.id, user.id, 'post-test');

          let progress = 'Not Started';
          if (postTest) {
            progress = 'Completed';
          } else if (preTest) {
            progress = 'In Progress';
          }

          return { ...chapter, progress };
        })
      );

      setChapters(chaptersWithProgress);
    } catch (error) {
      console.error('Error fetching chapter progress:', error);
      setChapters(baseChapters.map(ch => ({ ...ch, progress: 'Not Started' })));
    } finally {
      setLoading(false);
    }
  };

  const refreshQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  const getProgressColor = (progress) => {
    switch (progress) {
      case 'Completed': return '#4CAF50';
      case 'In Progress': return '#FFC107';
      case 'Not Started': return '#F44336';
      default: return '#666';
    }
  };

  const handleMetricsPress = (chapterNumber) => {
    setSelectedChapter(chapterNumber);
    setResultsModalOpen(true);
  };

 return (
    <View style={styles.gradientBackground}>
      <SidebarLayout activeTab="Dashboard" user={user}>
        <ScrollView style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.welcomeText}>
              {user ? `Welcome back, ${user.username || 'User'}!` : 'Loading user...'}
            </Text>
            {user?.userType === 'tutor' ? (
              <TouchableOpacity 
                style={styles.assessmentButton}
                onPress={() => setResourcesModalOpen(true)}
              >
                <Text style={styles.assessmentButtonText}>TUTOR RESOURCES</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.debugText}>TEST:{user?.userType}</Text>
            )}
          </View>

          <View style={styles.quoteContainer}>
            <TouchableOpacity onPress={refreshQuote} style={styles.quoteContent}>
              <Text style={styles.quoteText}>💡 {currentQuote}</Text>
              <Text style={styles.quoteRefresh}>Tap to refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.materialsHeaderRow}>
            <Text style={styles.materialsHeader}>MATERIALS</Text>
          </View>

          {loading ? (
            <SkeletonLoader />
          ) : (
            <View style={styles.chaptersList}>
              {chapters.map((chapter, index) => (
                <Pressable
                  key={index}
                  style={styles.chapterCard}
                  onPress={() => navigation.navigate('LearningMaterials', { 
                    chapterNumber: chapter.number,
                    user 
                  })}
                >
                  <View style={styles.chapterIconContainer}>
                    <Image source={chapter.icon} style={styles.chapterIcon} />
                  </View>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterHeader}>
                      {chapter.optional ? 'OPTIONAL' : `CHAPTER ${chapter.number}`}
                    </Text>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                  </View>
                  <View style={styles.chapterMeta}>
                    <Text style={[
                      styles.chapterProgress,
                      { color: getProgressColor(chapter.progress) }
                    ]}>
                      {chapter.progress}
                    </Text>
                    <TouchableOpacity 
                      style={styles.metricsButton}
                      onPress={() => handleMetricsPress(chapter.number)}
                    >
                      <Text style={styles.metricsButtonText}>Metrics</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </SidebarLayout>

      <AssessmentResults 
        open={resultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
        user={user}
        chapterNumber={selectedChapter}
      />

      <FacilitatorResourcesModal
        open={resourcesModalOpen}
        onClose={() => setResourcesModalOpen(false)}
        user={user}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    minHeight: '100%',
    padding: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  assessmentButton: {
    backgroundColor: '#00bbf0',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  assessmentButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1a1a1a',
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  quoteContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  quoteContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#38598b',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    backdropFilter: 'blur(10px)',
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#2a2a2a',
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  quoteRefresh: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '400',
  },
  materialsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  materialsHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 1.2,
  },
  chaptersList: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 16,
    width: '100%',
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    backdropFilter: 'blur(10px)',
    minHeight: 100,
  },
  chapterIconContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#5585b5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    elevation: 2,
    shadowColor: '#005792',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  chapterIcon: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  chapterInfo: {
    flex: 3,
    justifyContent: 'center',
    paddingRight: 16,
  },
  chapterHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  chapterTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 22,
  },
  chapterMeta: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  chapterProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricsButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricsButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  skeletonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 16,
    width: '100%',
    minHeight: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  skeletonElement: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeletonIcon: {
    width: 70,
    height: 70,
    marginRight: 24,
  },
  skeletonInfo: {
    flex: 3,
    gap: 12,
  },
  skeletonTitle: {
    height: 20,
    width: '60%',
  },
  skeletonSubtitle: {
    height: 16,
    width: '80%',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
  optionalBadge: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#FF9800', 
},

});