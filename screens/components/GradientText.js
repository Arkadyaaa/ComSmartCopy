import { Text, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

let MaskedView;
if (Platform.OS !== 'web') {
  MaskedView = require('@react-native-masked-view/masked-view').default;
}

export default function GradientText({ text, style, gradient }) {
  // WEB VERSION (CSS gradient text)
  if (Platform.OS === 'web') {
    return (
      <Text
        style={[
          style,
          {
            backgroundImage: `linear-gradient(135deg, ${gradient.colors.join(',')})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          },
        ]}
      >
        {text}
      </Text>
    );
  }

  // MOBILE VERSION (MaskedView)
  return (
    <MaskedView
      maskElement={
        <Text style={[style, styles.maskText]}>
          {text}
        </Text>
      }
    >
      <LinearGradient {...gradient}>
        <Text style={[style, styles.transparentText]}>
          {text}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  maskText: {
    backgroundColor: 'transparent',
  },
  transparentText: {
    opacity: 0,
  },
});
