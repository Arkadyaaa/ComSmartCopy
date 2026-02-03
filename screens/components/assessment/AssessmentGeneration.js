import { saveQuiz } from '../../../services/apiQuiz';
import chapter1Questions from '../../../assets/question_bank/chapter_1.json';
import chapter2Questions from '../../../assets/question_bank/chapter_2.json';
import chapter3Questions from '../../../assets/question_bank/chapter_3.json';
import chapter4Questions from '../../../assets/question_bank/chapter_4.json';

const CHAPTER_TOPICS = {
  1: 'Computer Hardware Assembly',
  2: 'Installer Preparation and Operating Systems Installation',
  3: 'Software Application Installation',
  4: 'Troubleshooting and Maintenance',
};

const QUESTION_BANKS = {
  1: chapter1Questions,
  2: chapter2Questions,
  3: chapter3Questions,
  4: chapter4Questions
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectRandomQuestions(questions, type, count) {
  const filtered = questions.filter(q => q.type === type);
  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, count);
}

export async function generateFormativeAssessment(chapterNumber, userId) {
  try {
    const questionBank = QUESTION_BANKS[chapterNumber] || [];
    
    const multipleChoice = selectRandomQuestions(questionBank, 'multiple', 7);
    const openEnded = selectRandomQuestions(questionBank, 'fill', 4);
    const trueFalse = selectRandomQuestions(questionBank, 'truefalse', 4);

    const questions = [
      ...multipleChoice.map(q => ({
        type: 'multiple',
        question: q.question,
        choices: q.choices,
        answer: q.answer
      })),
      ...openEnded.map(q => ({
        type: 'fill',
        question: q.question,
        answer: q.answer
      })),
      ...trueFalse.map(q => ({
        type: 'truefalse',
        question: q.question,
        answer: q.answer
      }))
    ];

    const quizData = {
      title: `Chapter ${chapterNumber} - ${CHAPTER_TOPICS[chapterNumber]}`,
      questions: questions,
      createdBy: userId,
      quiz_type: `chapter${chapterNumber}`
    };

    const savedQuiz = await saveQuiz(quizData);
    return savedQuiz;
  } catch (error) {
    console.error('Error generating assessment:', error);
    throw error;
  }
}
