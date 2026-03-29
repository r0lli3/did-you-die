import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  streak: number;
}

export function StreakCounter({ streak }: Props) {
  const label = streak === 1 ? 'day' : 'days';

  return (
    <View style={styles.container}>
      <Text style={styles.number}>{streak}</Text>
      <Text style={styles.label}>{label} streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  number: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
