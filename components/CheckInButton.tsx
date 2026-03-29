import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';

interface Props {
  checkedIn: boolean;
  onPress: () => void;
}

export function CheckInButton({ checkedIn, onPress }: Props) {
  const handlePress = async () => {
    if (checkedIn) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, checkedIn && styles.buttonDone]}
      onPress={handlePress}
      activeOpacity={checkedIn ? 1 : 0.8}
      disabled={checkedIn}
    >
      {checkedIn ? (
        <View style={styles.inner}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.doneText}>You're all set today</Text>
        </View>
      ) : (
        <View style={styles.inner}>
          <Text style={styles.buttonText}>I'm okay</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDone: {
    backgroundColor: Colors.success,
    shadowOpacity: 0.05,
  },
  inner: {
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    color: Colors.buttonPrimaryText,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  doneText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
});
