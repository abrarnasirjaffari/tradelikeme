import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function TradeRow({ trade }: TradeRowProps) {
  const isLong = trade.direction === 'LONG';
  const isPnlPositive = trade.pnl >= 0;

  return (
    <View style={styles.row}>
      <View style={styles.leftSection}>
        <View style={styles.symbolRow}>
          <Text style={styles.symbol}>{trade.symbol}</Text>
          <View
            style={[
              styles.directionBadge,
              isLong ? styles.longBadge : styles.shortBadge,
            ]}
          >
            <Text style={styles.directionText}>{trade.direction}</Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>${formatPrice(trade.entryPrice)}</Text>
          <Text style={styles.priceArrow}>→</Text>
          <Text style={styles.priceText}>${formatPrice(trade.exitPrice)}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text
          style={[
            styles.pnl,
            isPnlPositive ? styles.pnlPositive : styles.pnlNegative,
          ]}
        >
          {formatPnl(trade.pnl)}
        </Text>
        <Text style={styles.date}>{formatDate(trade.closedAt)}</Text>
      </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leftSection: {
    flex: 1,
    gap: 4,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  directionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  longBadge: {
    backgroundColor: '#3B82F6',
  },
  shortBadge: {
    backgroundColor: '#F59E0B',
  },
  directionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 12,
    color: '#64748B',
  },
  priceArrow: {
    fontSize: 12,
    color: '#94A3B8',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pnl: {
    fontSize: 15,
    fontWeight: '700',
  },
  pnlPositive: {
    color: '#22C55E',
  },
  pnlNegative: {
    color: '#EF4444',
  },
  date: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
