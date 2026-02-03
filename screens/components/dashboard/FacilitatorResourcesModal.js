import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Pressable, Platform, } from 'react-native';
import {
  addFacilitatorResource, getFacilitatorResources, deleteFacilitatorResource, downloadFacilitatorResource, selectFileWeb,
} from '../../../services/apiFacilitatorResources';

export default function FacilitatorResourcesModal({ open, onClose, user }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState('Chapter 1');

  const CHAPTERS = [
    'Chapter 1',
    'Chapter 2',
    'Chapter 3',
    'Chapter 4',
    'Extra',
  ];


  useEffect(() => {
    if (open && user?.id) {
      fetchResources();
    }
  }, [open, user]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getFacilitatorResources(user.id);
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      // Don't show alert for initial load - resources might just be empty
      if (filteredResources.length > 0) {
        Alert.alert('Error', 'Failed to load resources');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(
  (r) => r.chapter === selectedChapter
  );


  const handleAddFile = async () => {
    try {
      let file;

      // Use platform-specific file picker
      if (Platform.OS === 'web') {
        file = await selectFileWeb();
      } else {
        // For native, try to use expo-document-picker if available
        try {
          const DocumentPicker = require('expo-document-picker');
          const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
          });

          if (result.type !== 'success') {
            return;
          }
          file = result;
        } catch (error) {
          Alert.alert('Error', 'Document picker not available. Please use web interface.');
          return;
        }
      }

      setUploading(true);
      console.log('Uploading file:', file.name);
      await addFacilitatorResource(user.id, file, selectedChapter);
      console.log('File uploaded successfully');
      await fetchResources();
      Alert.alert('Success', 'File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = (fileId) => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file?',
      [
        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteFacilitatorResource(fileId, user.id);
              await fetchResources();
              Alert.alert('Success', 'File deleted successfully');
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete file: ' + error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleViewFile = async (resource) => {
    try {
      await downloadFacilitatorResource(resource);
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Failed to open file: ' + error.message);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Modal visible={open} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Facilitator Resources</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          ) : (
            <>
              <View style={styles.chapterContainer}>
  <Text style={styles.chapterLabel}>Filter by Chapter</Text>

  <View style={styles.chapterTabs}>
    {CHAPTERS.map((chapter) => {
      const isActive = selectedChapter === chapter;

      return (
        <Pressable
          key={chapter}
          onPress={() => setSelectedChapter(chapter)}
          style={[
            styles.chapterTab,
            isActive && styles.chapterTabActive,
          ]}
        >
          <Text
            style={[
              styles.chapterTabText,
              isActive && styles.chapterTabTextActive,
            ]}
          >
            {chapter}
          </Text>
        </Pressable>
      );
    })}
  </View>
</View>

              <ScrollView style={styles.resourcesList}>
                {filteredResources.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No resources uploaded yet</Text>
                  </View>
                ) : (
                  filteredResources.map((resource) => (
                    <View key={resource.id} style={styles.resourceCard}>
                      <View style={styles.resourceInfo}>
                        <Text style={styles.resourceName} numberOfLines={2}>
                           {resource.filename}
                        </Text>

                        <Text style={styles.resourceChapter}>
                          {resource.chapter}
                        </Text>

                        <Text style={styles.resourceDate}>
                          {formatDate(resource.timestamp)}
                        </Text>
                      </View>

                      <View style={styles.resourceActions}>
                        <TouchableOpacity
                          style={styles.viewButton}
                          onPress={() => handleViewFile(resource)}
                        >
                          <Text style={styles.actionButtonText}>View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteFile(resource.id)}
                        >
                          <Text style={styles.actionButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))

                )}
              </ScrollView>

              <TouchableOpacity
                style={[styles.addButton, uploading && styles.addButtonDisabled]}
                onPress={handleAddFile}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>+ Add PDF File</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  resourcesList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  resourceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  resourceInfo: {
    flex: 1,
    marginRight: 10,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  resourceDate: {
    fontSize: 12,
    color: '#999',
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FFD305',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1a1a1a',
  },
  resourceChapter: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  chapterContainer: {
  marginBottom: 14,
},

chapterLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#444',
  marginBottom: 8,
},

chapterTabs: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},

chapterTab: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: '#f0f0f0',
  borderWidth: 1,
  borderColor: '#ddd',
},

chapterTabActive: {
  backgroundColor: '#2196F3',
  borderColor: '#2196F3',
},

chapterTabText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#555',
},

chapterTabTextActive: {
  color: '#fff',
},

});
