import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';

export default function RecommendationModal({
  visible,
  onClose,
  loading,
  videos = [],
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          <Text style={styles.title}>Recommended Videos</Text>

          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <ScrollView>
              {videos.map((vid, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.videoCard}
                  onPress={() => Linking.openURL(vid.url)}
                >
                  <Text style={styles.videoTitle}>{vid.title}</Text>
                  <Text style={styles.videoChannel}>{vid.channel}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 15,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoCard: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  videoTitle: {
    fontWeight: 'bold',
  },
  videoChannel: {
    fontSize: 12,
    color: '#666',
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: 'center',
  },
  closeBtnText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});
