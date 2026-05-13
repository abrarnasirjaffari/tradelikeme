import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── tab bar label constants ──────────────────────────────────────────────────

const PRIMARY = '#1D4ED8';
const INACTIVE = '#94A3B8';
const TAB_BG = '#FFFFFF';
const BORDER = '#E2E8F0';

// ─── custom tab bar button (pill style) ──────────────────────────────────────

interface PillTabProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}

function PillTab({ icon, iconOutline, label, focused }: PillTabProps) {
  return (
    <View style={pillStyles.wrapper}>
      <View style={[pillStyles.pill, focused && pillStyles.pillActive]}>
        <Ionicons
          name={focused ? icon : iconOutline}
          size={18}
          color={focused ? '#FFFFFF' : INACTIVE}
        />
        <Text style={[pillStyles.label, focused && pillStyles.labelActive]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: PRIMARY,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: INACTIVE,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});

// ─── layout ──────────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopColor: BORDER,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <PillTab
              icon="home"
              iconOutline="home-outline"
              label="HOME"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trades"
        options={{
          tabBarIcon: ({ focused }) => (
            <PillTab
              icon="trending-up"
              iconOutline="trending-up-outline"
              label="TRADE"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="strategies"
        options={{
          tabBarIcon: ({ focused }) => (
            <PillTab
              icon="grid"
              iconOutline="grid-outline"
              label="STRAT"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          tabBarIcon: ({ focused }) => (
            <PillTab
              icon="wallet"
              iconOutline="wallet-outline"
              label="VAULT"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
