import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Position } from '@/types/api';

interface CloseTradeModalProps {
  visible: boolean;
  position: Position | null;
  onConfirm: () => void;
  onCancel: () => void;
  isClosing: boolean;
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

export default function CloseTradeModal({
  visible,
  position,
  onConfirm,
  onCancel,
  isClosing,
}: CloseTradeModalProps) {
  if (!position) return null;

  const isLong = position.direction === 'LONG';
  const isPnlPositive = position.unrealisedPnl >= 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={!isClosing ? onCancel : undefined}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Close Position</Text>
            {!isClosing && (
              <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.positionCard}>
            <View style={styles.positionRow}>
              <Text style={styles.coinSymbol}>{position.symbol}</Text>
              <View
                style={[
                  styles.directionBadge,
                  isLong ? styles.longBadge : styles.shortBadge,
                ]}
              >
                <Text style={styles.directionText}>{position.direction}</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Entry Price</Text>
                <Text style={styles.detailValue}>
                  ${formatPrice(position.entryPrice)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Current Price</Text>
                <Text style={styles.detailValue}>
                  ${formatPrice(position.currentPrice)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Qty</Text>
                <Text style={styles.detailValue}>{position.qty}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Unrealised P&L</Text>
                <Text
                  style={[
                    styles.detailValue,
                    styles.pnlValue,
                    isPnlPositive ? styles.pnlPositive : styles.pnlNegative,
                  ]}
                >
                  {formatPnl(position.unrealisedPnl)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={16} color="#F59E0B" />
            <Text style={styles.warningText}>
              This will close your position at market price
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, isClosing && styles.btnDisabled]}
              onPress={onCancel}
              disabled={isClosing}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closePositionBtn, isClosing && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={isClosing}
            >
              {isClosing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.closePositionBtnText}>Close Position</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  positionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  coinSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  longBadge: {
    backgroundColor: '#3B82F6',
  },
  shortBadge: {
    backgroundColor: '#F59E0B',
  },
  directionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    width: '46%',
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  pnlValue: {
    fontSize: 15,
  },
  pnlPositive: {
    color: '#22C55E',
  },
  pnlNegative: {
    color: '#EF4444',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  closePositionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePositionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
