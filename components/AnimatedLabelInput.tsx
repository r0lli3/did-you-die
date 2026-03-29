import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/colors';

interface AnimatedLabelInputProps extends TextInputProps {
  label: string;
  value: string;
}

export function AnimatedLabelInput({
  label,
  value,
  onFocus,
  onBlur,
  ...props
}: AnimatedLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const showLabel = isFocused || value.length > 0;

  const chars = label.split('');
  const anims = useRef(chars.map(() => new Animated.Value(0))).current;
  const prevShowLabel = useRef(showLabel);

  useEffect(() => {
    if (prevShowLabel.current === showLabel) return;
    prevShowLabel.current = showLabel;

    const STAGGER = 30;
    const animations = chars.map((_, i) => {
      const delay = showLabel ? i * STAGGER : (chars.length - 1 - i) * STAGGER;
      return Animated.timing(anims[i], {
        toValue: showLabel ? 1 : 0,
        duration: 180,
        delay,
        useNativeDriver: true,
      });
    });

    Animated.parallel(animations).start();
  }, [showLabel]);

  return (
    <View style={styles.container}>
      {/* Floating label — letters stagger up on focus/fill */}
      <View style={styles.labelRow} pointerEvents="none">
        {chars.map((char, i) => {
          const translateY = anims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -26],
          });
          const opacity = anims[i].interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [1, 0.2, 0],
          });
          return (
            <Animated.Text
              key={i}
              style={[styles.labelChar, { transform: [{ translateY }], opacity }]}
            >
              {char === ' ' ? '\u00A0' : char}
            </Animated.Text>
          );
        })}
      </View>

      <TextInput
        style={styles.input}
        value={value}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor="transparent"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingTop: 4,
  },
  labelRow: {
    position: 'absolute',
    top: '50%',
    left: 2,
    flexDirection: 'row',
    zIndex: 1,
  },
  labelChar: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.textPrimary,
    paddingVertical: 10,
    paddingHorizontal: 2,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    backgroundColor: 'transparent',
  },
});
