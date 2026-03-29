import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={styles.title}>Did You Die</Text>
        <Text style={styles.subtitle}>
          A simple daily check-in{'\n'}for your peace of mind.
        </Text>

        <View style={styles.features}>
          <FeatureRow text="Check in once a day" />
          <FeatureRow text="One emergency contact" />
          <FeatureRow text="They're notified if you miss check-ins" />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Takes about 1 minute to set up.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureDot} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 36,
    color: Colors.successDark,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    alignSelf: 'stretch',
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  featureText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 16,
  },
  button: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.buttonPrimaryText,
    fontSize: 17,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
