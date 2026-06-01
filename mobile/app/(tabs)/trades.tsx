import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function Trades() {
  const activeTrades = [
    { id: 1, pair: 'SOL/USD', type: 'LONG', entry: 145.20, tp: 152.00, sl: 141.00, pnl: '+3.2%', pnlColor: 'text-green-500', isProfitable: true },
    { id: 2, pair: 'BTC/USD', type: 'SHORT', entry: 64200.50, tp: 62000.00, sl: 65000.00, pnl: '-1.5%', pnlColor: 'text-red-500', isProfitable: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="p-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-textPrimary">Active Trades</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {activeTrades.map(trade => (
          <View key={trade.id} className="bg-white p-4 rounded-2xl border border-gray-200 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-textPrimary mr-2">{trade.pair}</Text>
                <View className={`px-2 py-1 rounded-md ${trade.type === 'LONG' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text className={`text-xs font-bold ${trade.type === 'LONG' ? 'text-green-700' : 'text-red-700'}`}>{trade.type}</Text>
                </View>
              </View>
              <Text className={`text-lg font-bold ${trade.pnlColor}`}>{trade.pnl}</Text>
            </View>
            
            <View className="flex-row justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <View>
                <Text className="text-xs text-textSecondary font-medium">Entry</Text>
                <Text className="text-sm font-bold text-textPrimary">${trade.entry}</Text>
              </View>
              <View>
                <Text className="text-xs text-textSecondary font-medium">TP</Text>
                <Text className="text-sm font-bold text-green-600">${trade.tp}</Text>
              </View>
              <View>
                <Text className="text-xs text-textSecondary font-medium">SL</Text>
                <Text className="text-sm font-bold text-red-600">${trade.sl}</Text>
              </View>
            </View>
          </View>
        ))}
        
        <Text className="text-center text-textSecondary mt-4 font-medium">End of active trades</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
