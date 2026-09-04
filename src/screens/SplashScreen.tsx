import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox} />
      <Text style={styles.title}>CREASY ECO</Text>
      <Text style={styles.subtitle}>Resource Tracking</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: colors.moss,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.paper,
    letterSpacing: 2,
  },
  subtitle: {
    ...typography.label,
    color: colors.gray,
    marginTop: spacing.xs,
  },
});
