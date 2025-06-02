import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';

const notifications = [
  { id: '1', icon: '📘', title: 'New Learning Material', message: '“Intro to Computer Hardware” has been uploaded.', timestamp: '10 mins ago' },
  { id: '2', icon: '📝', title: 'Reminder', message: 'Final Assessment is due tomorrow.', timestamp: '2 hours ago' },
  { id: '3', icon: '📢', title: 'Update', message: 'System maintenance on June 1, 2–4 PM.', timestamp: 'Today' },
  { id: '4', icon: '🎉', title: 'Congratulations!', message: 'You completed the Compatibility Quiz.', timestamp: 'Yesterday' },
  { id: '5', icon: '🧠', title: 'Tip of the Day', message: 'Review the CPU vs GPU comparison guide.', timestamp: 'Yesterday' },
  { id: '6', icon: '🔧', title: 'Part Picker', message: 'A new part has been added to the Part Picker.', timestamp: 'May 25, 2025' },
];

const NotificationCard = ({ icon, title, message, timestamp }) => (
  <View style={styles.card}>
    <Text style={styles.icon}>{icon}</Text>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  </View>
);

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            icon={item.icon}
            title={item.title}
            message={item.message}
            timestamp={item.timestamp}
          />
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  icon: { fontSize: 32, marginRight: 16 },
  textContainer: { flex: 1 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 2, color: '#222' },
  message: { fontSize: 15, color: '#444', marginBottom: 4 },
  timestamp: { fontSize: 13, color: '#888' },
});
