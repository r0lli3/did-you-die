import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'heart', inactive: 'heart-outline' },
  history: { active: 'calendar', inactive: 'calendar-outline' },
};

export function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 16 }]}>
      <BlurView
        intensity={80}
        tint="light"
        style={styles.blurContainer}
      >
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const icons = TAB_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                {isFocused && <View style={styles.activePill} />}
                <Ionicons
                  name={isFocused ? icons.active : icons.inactive}
                  size={24}
                  color={isFocused ? '#1A1A2E' : '#9CA3AF'}
                  style={styles.icon}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
  },
  blurContainer: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    // Fallback background for web / no blur
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.85)' : undefined,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  inner: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 48,
    borderRadius: 32,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    width: 48,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26,26,46,0.08)',
  },
  icon: {
    zIndex: 1,
  },
});
