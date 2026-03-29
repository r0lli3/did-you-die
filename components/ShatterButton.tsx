import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

interface Shard {
  id: number;
  anim: Animated.Value;
  opacityAnim: Animated.Value;
  scaleAnim: Animated.Value;
  velocityX: number;
  velocityY: number;
  rotation: number;
  size: number;
  clipPoints: string; // unused in RN, kept for parity
}

interface ShatterButtonProps {
  label: string;
  icon?: string;
  disabled?: boolean;
  isShattered?: boolean; // "done" state (grey)
  shardCount?: number;
  shatterColor?: string;
  onPress?: () => void;
}

export function ShatterButton({
  label,
  icon,
  disabled = false,
  isShattered: isDone = false,
  shardCount = 18,
  shatterColor = '#2DB54B',
  onPress,
}: ShatterButtonProps) {
  const [shards, setShards] = useState<Shard[]>([]);
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const buttonOpacityAnim = useRef(new Animated.Value(1)).current;
  const ringScaleAnim = useRef(new Animated.Value(0)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0)).current;

  const triggerShatter = useCallback(() => {
    if (disabled || isDone) return;

    // Build shards
    const newShards: Shard[] = Array.from({ length: shardCount }, (_, i) => {
      const angle = ((Math.PI * 2 * i) / shardCount) + (Math.random() * 0.5);
      const velocity = 60 + Math.random() * 120;
      return {
        id: i,
        anim: new Animated.ValueXY({ x: 0, y: 0 }),
        opacityAnim: new Animated.Value(1),
        scaleAnim: new Animated.Value(1),
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
        rotation: Math.random() * 720 - 360,
        size: 4 + Math.random() * 10,
        clipPoints: '',
      };
    });

    setShards(newShards);

    // Button shrinks away
    Animated.parallel([
      Animated.timing(buttonScaleAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(buttonOpacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();

    // Explosion ring
    Animated.parallel([
      Animated.timing(ringScaleAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(ringOpacityAnim, { toValue: 0.8, duration: 50, useNativeDriver: true }),
        Animated.timing(ringOpacityAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
    ]).start();

    // Animate each shard outward
    newShards.forEach((shard) => {
      Animated.parallel([
        Animated.timing(shard.anim, {
          toValue: { x: shard.velocityX, y: shard.velocityY },
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shard.opacityAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(shard.scaleAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Fire callback
    onPress?.();

    // Clean up after animation
    setTimeout(() => {
      setShards([]);
      buttonScaleAnim.setValue(1);
      buttonOpacityAnim.setValue(1);
      ringScaleAnim.setValue(0);
      ringOpacityAnim.setValue(0);
    }, 900);
  }, [disabled, isDone, shardCount, onPress]);

  const color = isDone ? '#C8C8C8' : shatterColor;
  const BUTTON_SIZE = 220;

  return (
    <View style={[styles.wrapper, { width: BUTTON_SIZE, height: BUTTON_SIZE }]}>

      {/* Explosion ring */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            borderColor: shatterColor,
            width: BUTTON_SIZE * 1.8,
            height: BUTTON_SIZE * 1.8,
            borderRadius: BUTTON_SIZE,
            opacity: ringOpacityAnim,
            transform: [{ scale: ringScaleAnim }],
          },
        ]}
      />

      {/* Shards */}
      {shards.map((shard) => (
        <Animated.View
          key={shard.id}
          pointerEvents="none"
          style={[
            styles.shard,
            {
              width: shard.size,
              height: shard.size,
              backgroundColor: shatterColor,
              shadowColor: shatterColor,
              opacity: shard.opacityAnim,
              transform: [
                { translateX: (shard.anim as any).x },
                { translateY: (shard.anim as any).y },
                { scale: shard.scaleAnim },
                { rotate: `${shard.rotation}deg` },
              ],
            },
          ]}
        />
      ))}

      {/* The button */}
      <Animated.View
        style={{
          transform: [{ scale: buttonScaleAnim }],
          opacity: buttonOpacityAnim,
        }}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius: BUTTON_SIZE / 2,
              backgroundColor: `${color}22`,
              borderColor: `${color}66`,
              shadowColor: color,
            },
          ]}
          onPress={triggerShatter}
          disabled={disabled || isDone}
          activeOpacity={0.85}
        >
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={[styles.label, { color }]}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  shard: {
    position: 'absolute',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  icon: {
    fontSize: 44,
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
