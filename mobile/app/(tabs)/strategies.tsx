import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Strategies() {
  const strategies = [
    { id: 1, name: 'SD Zones Pro', author: 'TradeLikeMe', winRate: '68%', rr: '1:2.5', followers: 1240 },
    { id: 2, name: 'Momentum Scalp', author: 'CryptoWhale', winRate: '55%', rr: '1:1.5', followers: 850 },
    { id: 3, name: 'Swing Master', author: 'AlphaTrader', winRate: '42%', rr: '1:4.0', followers: 420 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-textPrimary">Marketplace</Text>
        <Text className="text-textSecondary mt-1">Discover and follow top strategies</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {strategies.map(strat => (
          <TouchableOpacity key={strat.id} className="bg-white p-5 rounded-2xl border border-gray-200 mb-4">
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="text-lg font-bold text-textPrimary">{strat.name}</Text>
                <Text className="text-sm text-textSecondary">by {strat.author}</Text>
              </View>
              <View className="bg-primary/10 px-2 py-1 rounded-md">
                <Text className="text-primary font-bold text-xs">{strat.followers} followers</Text>
              </View>
            </View>
            
            <View className="flex-row space-x-6 mt-2">
              <View className="mr-6">
                <Text className="text-xs text-textSecondary font-medium">Win Rate</Text>
                <Text className="text-lg font-bold text-green-600">{strat.winRate}</Text>
              </View>
              <View>
                <Text className="text-xs text-textSecondary font-medium">Avg R:R</Text>
                <Text className="text-lg font-bold text-textPrimary">{strat.rr}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
