import supabase from './supabase';

// Save a quiz (used by QuizScreen.save)
export async function saveQuiz(quizData) {
  const { data, error } = await supabase
    .from('quiz')
    .insert([{
      title: quizData.title,
      created_by: quizData.createdBy,
      quiz_data: quizData.questions,
      quiz_type: quizData.quiz_type,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('saveQuiz error', error);
    throw error;
  }
  return data;
}

export async function getQuizzesByUser(userId) {
  const { data, error } = await supabase
    .from('quiz')
    .select(`
      *,
      quiz_submission (
        id,
        score,
        user_id,
        submitted_at,
        assessment_type 
      )
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getQuizzesByUser error', error);
    throw error;
  }
  return data;
}

// Submit quiz result
export async function submitQuiz(submission) {
  try {
    const payload = {
      quiz_id: submission.quizId,
      user_id: submission.userId,
      answers: submission.answers,
      score: submission.score,
      assessment_type: submission.assessmentType,
      submitted_at: new Date().toISOString()
    };

    // Try to find existing submission
    const { data: existing, error: checkError } = await supabase
      .from('quiz_submission')
      .select('id')
      .eq('quiz_id', submission.quizId)
      .eq('user_id', submission.userId)
      .eq('assessment_type', submission.assessmentType);

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let result;

    if (existing && existing.length > 0) {
      // Update existing submission
      result = await supabase
        .from('quiz_submission')
        .update(payload)
        .eq('id', existing[0].id)
        .select();

      if (result.error) throw result.error;
    } else {
      // Insert new submission
      result = await supabase
        .from('quiz_submission')
        .insert([payload])
        .select();

      if (result.error) throw result.error;
    }

    return result.data?.[0];
  } catch (error) {
    console.error('submitQuiz error:', error);
    throw new Error('Failed to submit quiz: ' + (error.message || String(error)));
  }
}

export async function getQuizSubmissions(quizId) {
  const { data, error } = await supabase
    .from('quiz_submission')
    .select(`
      *,
      "User":user_id ( id, username, emailAddress )
    `)
    .eq('quiz_id', quizId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('getQuizSubmissions error', error);
    throw error;
  }
  return data;
}

export async function getChapterPostTestSubmission(userId, chapterType) {
  const { data, error } = await supabase
    .from('quiz_submission')
    .select('*, quiz!inner(quiz_type)')
    .eq('user_id', userId)
    .eq('assessment_type', 'post-test')
    .eq('quiz.quiz_type', chapterType) 
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle(); 

  if (error) {
    console.error('Post-test fetch error:', error);
    throw error;
  }

  return data;
}

export async function updateQuiz(id, quiz) {
  try {
    console.log("Attempting to update quiz:", { id, quiz });

    const { data, error } = await supabase
      .from("quiz")
      .update({
        title: quiz.title,
        quiz_data: quiz.questions,   
        quiz_type: quiz.quiz_type,   
        created_by: quiz.createdBy
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error(" Error updating quiz:", error);
      return { ok: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn(` No quiz found with ID: ${id}`);
      return { ok: false, error: "Quiz not found" };
    }

    console.log(" Quiz updated:", data[0]);
    return { ok: true, quiz: data[0] };
  } catch (err) {
    console.error(" Unexpected error in updateQuiz:", err);
    return { ok: false, error: err.message };
  }
}

export const deleteQuiz = async (id) => {
  console.log("Attempting to delete quiz:", id);

  const { error } = await supabase.from("quiz").delete().eq("id", id);

  if (error) {
    console.error("Error deleting quiz:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
};

export async function getUserQuizSubmission(quizId, userId, assessmentType) {
  const { data, error } = await supabase
    .from('quiz_submission')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('user_id', userId)
    .eq('assessment_type', assessmentType)
    .single();

  if (error && error.code !== 'PGRST116') { 
    console.error('getUserQuizSubmission error', error);
    throw error;
  }
  return data;
}

export async function deleteQuizSubmission(quizId, userId, assessmentType) {
  try {
    const { error } = await supabase
      .from('quiz_submission')
      .delete()
      .match({ quiz_id: quizId, user_id: userId, assessment_type: assessmentType });

    if (error) {
      console.error('Delete submission error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('deleteQuizSubmission error:', error);
    throw error;
  }
}

export async function getSummativeAssessment(userId) {
  const { data, error } = await supabase
    .from('quiz')
    .select('*')
    .eq('quiz_type', 'summative')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { 
    console.error('getSummativeAssessment error', error);
    throw error;
  }
  return data;
}

export async function saveSummativeAssessment(assessmentData, userId) {
  const { data, error } = await supabase
    .from('quiz')
    .insert([{
      title: assessmentData.metadata.title,
      created_by: userId,
      quiz_data: assessmentData.questions,
      quiz_type: 'summative',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('saveSummativeAssessment error', error);
    throw error;
  }
  return data;
}

