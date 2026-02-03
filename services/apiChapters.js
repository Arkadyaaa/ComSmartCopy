import supabase from './supabase';

// GET all chapters
export async function getChapters() {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .order('chapter_number', { ascending: true });

  if (error) {
    console.error('getChapters error:', error);
    throw error;
  }
  return data;
}

// GET single chapter by number
export async function getChapterByNumber(chapterNumber) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('chapter_number', chapterNumber)
    .single();

  if (error) {
    console.error('getChapterByNumber error:', error);
    throw error;
  }
  return data;
}

// CREATE new chapter
export async function createChapter(chapterData) {
  const { data, error } = await supabase
    .from('chapters')
    .insert([{
      chapter_number: chapterData.chapter_number,
      title: chapterData.title,
      description: chapterData.description,
      content: chapterData.content,
      progress_status: chapterData.progress_status || 'Not Started',
      necessity: chapterData.necessity || 'Required',
      icon_name: chapterData.icon_name || 'CPU.png'
    }])
    .select()
    .single();

  if (error) {
    console.error('createChapter error:', error);
    throw error;
  }
  return data;
}

// UPDATE chapter
export async function updateChapter(chapterNumber, updateData) {
  const { data, error } = await supabase
    .from('chapters')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('chapter_number', chapterNumber)
    .select()
    .single();

  if (error) {
    console.error('updateChapter error:', error);
    throw error;
  }
  return data;
}

// DELETE chapter
export async function deleteChapter(chapterNumber) {
  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('chapter_number', chapterNumber);

  if (error) {
    console.error('deleteChapter error:', error);
    throw error;
  }
  return { success: true };
}

// GET user progress for chapters
export async function getUserChapterProgress(userId) {
  const { data, error } = await supabase
    .from('user_chapter_progress')
    .select(`
      *,
      chapters (
        id,
        chapter_number,
        title,
        description,
        necessity,
        icon_name
      )
    `)
    .eq('user_id', userId)
    .order('chapter_number', { ascending: true });

  if (error) {
    console.error('getUserChapterProgress error:', error);
    throw error;
  }
  return data;
}

// UPDATE user progress for a chapter
export async function updateUserChapterProgress(userId, chapterNumber, progressStatus) {
  const { data, error } = await supabase
    .from('user_chapter_progress')
    .upsert({
      user_id: userId,
      chapter_id: chapterNumber, // This will need the actual chapter ID from chapters table
      progress_status: progressStatus,
      last_accessed: new Date().toISOString(),
      ...(progressStatus === 'In Progress' && { started_at: new Date().toISOString() }),
      ...(progressStatus === 'Completed' && { completed_at: new Date().toISOString() })
    })
    .select()
    .single();

  if (error) {
    console.error('updateUserChapterProgress error:', error);
    throw error;
  }
  return data;
}

// GET chapters with user progress (for dashboard)
export async function getChaptersWithUserProgress(userId) {
  const { data, error } = await supabase
    .from('chapters')
    .select(`
      *,
      user_chapter_progress!left (
        progress_status,
        started_at,
        completed_at,
        last_accessed
      )
    `)
    .eq('user_chapter_progress.user_id', userId)
    .order('chapter_number', { ascending: true });

  if (error) {
    console.error('getChaptersWithUserProgress error:', error);
    throw error;
  }
  
  // Transform data to match your current dashboard format
  return data.map(chapter => ({
    number: chapter.chapter_number,
    title: chapter.title,
    description: chapter.description,
    progress: chapter.user_chapter_progress[0]?.progress_status || 'Not Started',
    necessity: chapter.necessity,
    icon: require(`../../assets/part_icons/${chapter.icon_name}`),
    content: chapter.content,
    lastAccessed: chapter.user_chapter_progress[0]?.last_accessed
  }));
}