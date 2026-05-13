import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import LoadingSkeleton from './LoadingSkeleton';

interface PnlCardProps {
  label: string;
  value: string;
  isPositive?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function PnlCard({
  label,
  value,
  isPositive,
  isLoading = false,
  style,
}: PnlCardProps) {
  const valueColor =
    isPositive === true
      ? '#22C55E'
      : isPositive === false
        ? '#EF4444'
        : '#3B82F6';

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      {isLoading ? (
        <LoadingSkeleton width={80} height={24} borderRadius={4} style={styles.skeleton} />
      ) : (
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minWidth: 110,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  skeleton: {
    marginTop: 4,
  },
});
