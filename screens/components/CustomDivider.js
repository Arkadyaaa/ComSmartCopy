import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomDivider() {
  return (
    <LinearGradient
      colors={['transparent', '#E5E7EB', 'transparent']} // edges transparent, middle solid
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ height: 2, width: '100%', marginBottom: 12 }}
    />
  );
}