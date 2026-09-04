import { View, Text, Image, StyleSheet } from "react-native";
import { colors, typography, spacing } from "../theme/tokens";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo_bgr.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>CREASY ECO</Text>
      <Text style={styles.subtitle}>Resource Tracking</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 96,
    height: 96,
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
