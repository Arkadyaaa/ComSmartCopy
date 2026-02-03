import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, LinearProgress } from '@mui/material';

import SidebarLayout from './SidebarLayout';
import { chapters } from './CHAPTER';
import { loadStorage, saveStorage } from '../components/learning-materials/constants';
import ChapterStartView from '../components/learning-materials/ChapterStartView';
import ChapterContentView from '../components/learning-materials/ChapterContentView';
import AssessmentModal from '../components/learning-materials/AssessmentModal';
import {
  getLearningMaterials,
  uploadLearningMaterial,
  deleteLearningMaterial,
  downloadLearningMaterial,
  selectFileWeb,
  formatFileSize,
} from '../../services/apiLearningMaterials';

export default function LearningMaterialsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const routeUser = route.params?.user;
  const [user, setUser] = useState(routeUser || null);
  const chapterNumber = route.params?.chapterNumber;
  
  // Materials upload/list state
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Chapter-specific tutor upload state
  const [chapterMaterials, setChapterMaterials] = useState([]);
  const [chapterMaterialsLoading, setChapterMaterialsLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chapterUploading, setChapterUploading] = useState(false);
  
  // Chapter learning state
  const [currentSection, setCurrentSection] = useState(0);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [stepChecks, setStepChecks] = useState({});
  
  const [role, setRole] = useState(route.params?.user?.userType || null);

  const isTutor = role === 'tutor' || role === 'facilitator' || user?.userType?.toLowerCase?.() === 'tutor' || user?.userType?.toLowerCase?.() === 'facilitator';

  const hydrateRole = async () => {
    let storedRole = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const noAuth = localStorage.getItem('noAuth');
        const lr = localStorage.getItem('role');
        if (noAuth === 'true' && lr) storedRole = lr;
      }
    } catch (_) {}
    if (!storedRole) {
      const flag = await AsyncStorage.getItem('noAuth');
      if (flag === 'true') {
        storedRole = await AsyncStorage.getItem('role');
      }
    }
    return storedRole;
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await getLearningMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      Alert.alert('Error', 'Failed to load learning materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterMaterials = async (chapterNo) => {
    setChapterMaterialsLoading(true);
    try {
      const data = await getLearningMaterials(Number(chapterNo));
      setChapterMaterials(data);
    } catch (error) {
      console.error('Error fetching chapter materials:', error);
    } finally {
      setChapterMaterialsLoading(false);
    }
  };

  useEffect(() => {
    const hydrateUser = async () => {
      try {
        if (routeUser) {
          setUser(routeUser);
          await AsyncStorage.setItem('userData', JSON.stringify(routeUser));
        } else {
          const stored = await AsyncStorage.getItem('userData');
          if (stored) {
            setUser(JSON.parse(stored));
          }
        }
        const storedRole = await hydrateRole();
        if (storedRole) {
          setRole(storedRole === 'student' ? 'participant' : storedRole);
        } else if (routeUser?.userType) {
          setRole(routeUser.userType.toLowerCase());
        }
      } catch (error) {
        console.warn('User session not found', error);
      }
    };
    hydrateUser();
  }, [routeUser]);

  useEffect(() => {
    if (!user) return;
  }, [user]);

  // Fetch learning materials when not in chapter view
  useEffect(() => {
    if (!chapterNumber) {
      fetchMaterials();
    }
  }, [chapterNumber]);

  // Tutor-only chapter materials load
  useEffect(() => {
    if (chapterNumber && isTutor) {
      fetchChapterMaterials(chapterNumber);
    }
  }, [chapterNumber, isTutor]);

  // Chapter-related effects (only run when chapterNumber exists)
  useEffect(() => {
    if (chapterNumber) {
      setCurrentSection(0);
      const savedChecks = loadStorage(`lm:checks:chapter:${chapterNumber}`, {});
      setStepChecks(savedChecks || {});
    }
  }, [chapterNumber]);

  useEffect(() => {
    if (chapterNumber && currentSection >= 0) {
      saveStorage(`lm:progress:chapter:${chapterNumber}`, currentSection);
    }
  }, [currentSection, chapterNumber]);

  // Keyboard navigation for chapters
  useEffect(() => {
    if (!chapterNumber || currentSection === 0) return;
    
    const currentChapter = chapters[chapterNumber];
    if (!currentChapter) return;
    
    const totalSections = currentChapter.sections.length;
    const handler = (e) => {
      if (e.key === 'ArrowRight' && currentSection < totalSections && currentSection >= 1) {
        setCurrentSection(Math.min(currentSection + 1, totalSections));
      } else if (e.key === 'ArrowLeft' && currentSection > 1) {
        setCurrentSection(Math.max(currentSection - 1, 1));
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [currentSection, chapterNumber]);

  const pickFile = async () => {
    let file;
    if (Platform.OS === 'web') {
      file = await selectFileWeb();
    } else {
      try {
        const DocumentPicker = require('expo-document-picker');
        const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true,
        });

        if (result.type !== 'success') {
          return null;
        }
        file = result;
      } catch (error) {
        Alert.alert('Error', 'Document picker not available. Please use web interface.');
        return null;
      }
    }
    return file;
  };

  const handleUpload = async () => {
    try {
      const file = await pickFile();
      if (!file) return;

      setUploading(true);
      await uploadLearningMaterial(user.id, file);
      await fetchMaterials();
      Alert.alert('Success', 'File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleOpenUploadModal = () => {
    setUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setSelectedFile(null);
    setUploadModalOpen(false);
  };

  const handleSelectChapterFile = async () => {
    const file = await pickFile();
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleChapterUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Select a file', 'Please choose a file to upload.');
      return;
    }
    if (!user?.id) {
      Alert.alert('No user session', 'Please login again.');
      return;
    }
    try {
      setChapterUploading(true);
      await uploadLearningMaterial(user.id, selectedFile, null, chapterNumber);
      await fetchChapterMaterials(chapterNumber);
      handleCloseUploadModal();
      Alert.alert('Success', 'Material uploaded for this chapter.');
    } catch (error) {
      console.error('Error uploading chapter material:', error);
      Alert.alert('Error', 'Failed to upload material: ' + error.message);
    } finally {
      setChapterUploading(false);
    }
  };

  const handleDelete = (materialId) => {
    Alert.alert(
      'Delete Material',
      'Are you sure you want to delete this material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLearningMaterial(materialId, user.id);
              await fetchMaterials();
              Alert.alert('Success', 'Material deleted successfully');
            } catch (error) {
              console.error('Error deleting material:', error);
              Alert.alert('Error', 'Failed to delete material: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const handleView = async (material) => {
    try {
      await downloadLearningMaterial(material);
    } catch (error) {
      console.error('Error viewing material:', error);
      Alert.alert('Error', 'Failed to open material: ' + error.message);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      default:
        return '📎';
    }
  };

  // If chapterNumber is provided, show chapter learning view
  const currentChapter = chapterNumber ? chapters[chapterNumber] : null;

  // Chapter learning view (when chapterNumber is provided)
  if (currentChapter) {
    const totalSections = currentChapter.sections.length;
    
    const nextSection = () => {
      if (currentSection < totalSections && currentSection >= 1) {
        setCurrentSection(Math.min(currentSection + 1, totalSections));
      }
    };
    const prevSection = () => {
      if (currentSection > 1) {
        setCurrentSection(Math.max(currentSection - 1, 1));
      }
    };

    const getSectionKey = (sectionIndex, stepIndex) => `s${sectionIndex}-i${stepIndex}`;
    const toggleStep = (sectionIndex, stepIndex) => {
      const key = getSectionKey(sectionIndex, stepIndex);
      const updated = { ...stepChecks, [key]: !stepChecks[key] };
      setStepChecks(updated);
      saveStorage(`lm:checks:chapter:${chapterNumber}`, updated);
    };

    const handleSectionSelect = (section) => {
      if (section >= 1 && section <= totalSections) {
        setCurrentSection(section);
      }
    };

    if (currentSection === 0) {
      return (
        <SidebarLayout activeTab="Learning Materials" user={user}>
          <ChapterStartView
            chapterNumber={chapterNumber}
            currentChapter={currentChapter}
            user={user}
            onStartLearning={(section = 1) => setCurrentSection(section)}
            assessmentModalOpen={assessmentModalOpen}
            onAssessmentModalOpen={() => setAssessmentModalOpen(true)}
            onAssessmentModalClose={() => setAssessmentModalOpen(false)}
          />
        </SidebarLayout>
      );
    }

    return (
      <SidebarLayout activeTab="Learning Materials" user={user}>
        <ChapterContentView
          chapterNumber={chapterNumber}
          currentChapter={currentChapter}
          currentSection={currentSection}
          totalSections={totalSections}
          user={user}
          stepChecks={stepChecks}
          onToggleStep={toggleStep}
          onPreviousSection={prevSection}
          onNextSection={nextSection}
          onSectionSelect={handleSectionSelect}
          tutorUploadProps={{
            isTutor,
            materials: chapterMaterials,
            loading: chapterMaterialsLoading,
            onOpenUploadModal: handleOpenUploadModal,
          }}
        />
        <UploadMaterialModal
          open={uploadModalOpen}
          onClose={handleCloseUploadModal}
          onSelectFile={handleSelectChapterFile}
          onUpload={handleChapterUpload}
          selectedFile={selectedFile}
          uploading={chapterUploading}
        />
        <AssessmentModal 
          open={assessmentModalOpen}
          onClose={() => setAssessmentModalOpen(false)}
          user={user}
          chapterNumber={chapterNumber}
        />
      </SidebarLayout>
    );
  }

  // Materials upload/list view (default when no chapterNumber)
  return (
    <SidebarLayout activeTab="Learning Materials" user={user}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Learning Materials</Text>
          {isTutor && (
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.uploadButtonText}>+ Upload Material</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5585b5" />
            <Text style={styles.loadingText}>Loading materials...</Text>
          </View>
        ) : materials.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No learning materials available</Text>
            {isTutor && (
              <Text style={styles.emptySubtext}>Upload your first material to get started</Text>
            )}
          </View>
        ) : (
          <ScrollView style={styles.materialsList} contentContainerStyle={styles.materialsListContent}>
            {materials.map((material) => (
              <View key={material.id} style={styles.materialCard}>
                <View style={styles.materialIconContainer}>
                  <Text style={styles.materialIcon}>{getFileIcon(material.type)}</Text>
                </View>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName} numberOfLines={2}>
                    {material.name}
                  </Text>
                  <View style={styles.materialMeta}>
                    <Text style={styles.materialType}>{material.type.toUpperCase()}</Text>
                    <Text style={styles.materialSize}>{formatFileSize(material.size)}</Text>
                    <Text style={styles.materialDate}>
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.materialActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleView(material)}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                  {isTutor && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(material.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SidebarLayout>
  );
}

function UploadMaterialModal({ open, onClose, onSelectFile, onUpload, selectedFile, uploading }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Learning Material</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Upload PDF, image, or video files without leaving this page.
        </Typography>
        <Button variant="outlined" onClick={onSelectFile} disabled={uploading}>
          {selectedFile ? 'Change File' : 'Choose File'}
        </Button>
        {selectedFile && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {selectedFile.name || 'Selected file'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedFile.mimeType || selectedFile.type || 'Unknown type'}
            </Typography>
          </Box>
        )}
        {uploading && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>Cancel</Button>
        <Button onClick={onUpload} variant="contained" disabled={uploading || !selectedFile}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ededed',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  uploadButton: {
    backgroundColor: '#5585b5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  materialsList: {
    flex: 1,
  },
  materialsListContent: {
    paddingBottom: 20,
  },
  materialCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  materialIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  materialIcon: {
    fontSize: 28,
  },
  materialInfo: {
    flex: 1,
    marginRight: 16,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  materialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  materialType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5585b5',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  materialSize: {
    fontSize: 12,
    color: '#666',
  },
  materialDate: {
    fontSize: 12,
    color: '#999',
  },
  materialActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    backgroundColor: '#5585b5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#ff6961',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
