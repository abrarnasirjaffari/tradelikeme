import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Trade } from '@/types/api';

interface TradeRowProps {
  trade: Trade;
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function formatPnl(pnl: number): string {
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}$${Math.abs(pnl).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function TradeRow({ trade }: TradeRowProps) {
  const isLong = trade.direction === 'LONG';
  const isPnlPositive = trade.pnl >= 0;

  // Circle color: green for long wins, red for short or loss
  const isWin = trade.status === 'WIN';
  const circleColor = isLong && isWin ? '#22C55E' : '#EF4444';
  const iconName: 'arrow-up-outline' | 'arrow-down-outline' =
    isLong ? 'arrow-up-outline' : 'arrow-down-outline';

  return (
    <View style={styles.row}>
      {/* Left: colored circle icon + text stack */}
      <View style={styles.leftSection}>
        {/* Colored circle */}
        <View style={[styles.iconCircle, { backgroundColor: circleColor + '1A' }]}>
          <Ionicons name={iconName} size={18} color={circleColor} />
        </View>

        {/* Text column */}
        <View style={styles.textStack}>
          <Text style={styles.symbol}>
            {trade.symbol} {trade.direction}
          </Text>
          <Text style={styles.subline}>
            ${formatPrice(trade.entryPrice)} → ${formatPrice(trade.exitPrice)} · {formatDate(trade.closedAt)}
          </Text>
        </View>
      </View>

      {/* Right: P&L */}
      <Text style={[styles.pnl, isPnlPositive ? styles.pnlPositive : styles.pnlNegative]}>
        {formatPnl(trade.pnl)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Colored circle with transparent background
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStack: {
    flex: 1,
    gap: 3,
  },
  symbol: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  subline: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '400',
  },
  pnl: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  pnlPositive: {
    color: '#22C55E',
  },
  pnlNegative: {
    color: '#EF4444',
  },
});
