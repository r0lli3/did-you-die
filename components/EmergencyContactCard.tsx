import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { EmergencyContact } from '../lib/types';

interface Props {
  contact: EmergencyContact;
}

export function EmergencyContactCard({ contact }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.relationship}>{contact.relationship}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  relationship: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
