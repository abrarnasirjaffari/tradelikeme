import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const PRIMARY = '#1D4ED8';
const SUCCESS = '#22C55E';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];
const PAY_WITH = ['USDC', 'CASH'] as const;
type PayWith = typeof PAY_WITH[number];

export default function DepositScreen() {
  const [amount, setAmount] = useState(1000);
  const [payWith, setPayWith] = useState<PayWith>('USDC');

  const handleConfirm = () => {
    Alert.alert(
      'Deposit Confirmed',
      `Depositing $${amount.toLocaleString()} via ${payWith} into S/D Zone Strategy vault.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.headerTitle}>Deposit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount display */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Enter Amount</Text>
          <Text style={styles.amountDisplay}>${amount.toLocaleString()}</Text>
        </View>

        {/* Quick-select pills */}
        <View style={styles.pillsRow}>
          {QUICK_AMOUNTS.map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.pill, amount === a && styles.pillActive]}
              onPress={() => setAmount(a)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, amount === a && styles.pillTextActive]}>
                ${a.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pay with */}
        <Text style={styles.sectionLabel}>Pay with</Text>
        <View style={styles.payWithRow}>
          {PAY_WITH.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.payWithCard, payWith === option && styles.payWithCardActive]}
              onPress={() => setPayWith(option)}
              activeOpacity={0.8}
            >
              <Text style={[styles.payWithText, payWith === option && styles.payWithTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Strategy */}
        <Text style={styles.sectionLabel}>Strategy</Text>
        <View style={styles.strategyCard}>
          <View style={styles.strategyLeft}>
            <View style={styles.logoChip}>
              <Text style={styles.logoChipText}>TL</Text>
            </View>
            <Text style={styles.strategyName}>S/D Zone Strategy</Text>
          </View>
          <Text style={styles.strategyWinRate}>89%</Text>
        </View>

        {/* Fee summary */}
        <View style={styles.feeSummary}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Deposit Amount</Text>
            <Text style={styles.feeValue}>${amount.toLocaleString()}.00</Text>
          </View>
          <View style={styles.feeDivider} />
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Network Fee</Text>
            <Text style={styles.feeValue}>~$0.01</Text>
          </View>
          <View style={styles.feeDivider} />
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Profit Share</Text>
            <Text style={styles.feeValue}>20% on gains only</Text>
          </View>
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirm Deposit</Text>
        </TouchableOpacity>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Funds are held in a non-custodial Solana vault. Only the agent can trade — never withdraw.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backArrow: {
    fontSize: 20,
    color: '#0F172A',
    lineHeight: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },

  // Amount
  amountSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  amountDisplay: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Pills
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  pillActive: {
    backgroundColor: PRIMARY,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },

  // Section label
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 10,
  },

  // Pay with
  payWithRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  payWithCard: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  payWithCardActive: {
    borderColor: PRIMARY,
    backgroundColor: '#FFFFFF',
  },
  payWithText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  payWithTextActive: {
    color: PRIMARY,
  },

  // Strategy card
  strategyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  strategyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  strategyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  strategyWinRate: {
    fontSize: 14,
    fontWeight: '700',
    color: SUCCESS,
  },

  // Fee summary
  feeSummary: {
    marginBottom: 28,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  feeDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  feeLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Confirm button
  confirmBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Footer
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
