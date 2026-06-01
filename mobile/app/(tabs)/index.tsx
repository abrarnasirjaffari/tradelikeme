import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PnLCard } from '../../components/PnLCard'; // Wait, it's a default export right now

export default function Dashboard() {
  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <StatusBar style="dark" />
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-textPrimary">TradeLikeMe</Text>
        <View className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-primary font-semibold">Agent: Active</Text>
        </View>
      </View>
      
      <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
        <Text className="text-textSecondary mb-1 text-sm font-medium">Total P&L</Text>
        <Text className="text-3xl font-bold text-green-500">+$1,245.50</Text>
      </View>

      <Text className="text-lg font-bold text-textPrimary mb-4">Active Vaults</Text>
      <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <Text className="text-textPrimary font-semibold mb-1">SD Zones Strategy</Text>
        <Text className="text-textSecondary text-sm">Balance: $500.00 USDC</Text>
      </View>
    </SafeAreaView>
  );
}
