// screens/dashboard/CHAPTER/index.js
// Central export file for all chapter data

import { chapter1Data } from './chapter1Data';
import { chapter2Data } from './chapter2Data';
import { chapter3Data } from './chapter3Data';
import { chapter4Data } from './chapter4Data';

export const chapters = {
  1: chapter1Data,
  2: chapter2Data,
  3: chapter3Data,
  4: chapter4Data,
};

// Helper function to get chapter by number
export const getChapter = (chapterNumber) => {
  return chapters[chapterNumber] || null;
};

// Helper function to get all chapter numbers
export const getAllChapterNumbers = () => {
  return Object.keys(chapters).map(Number);
};