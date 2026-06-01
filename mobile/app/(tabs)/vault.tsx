import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Vault() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-textPrimary">Your Vaults</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        <View className="bg-gradient-to-r from-primary to-secondary p-6 rounded-3xl mb-6">
          <Text className="text-blue-100 font-medium mb-1">Total Vault Balance</Text>
          <Text className="text-4xl font-bold text-white mb-6">$2,540.00 <Text className="text-xl font-normal text-blue-200">USDC</Text></Text>
          
          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 bg-white py-3 rounded-xl items-center mr-2">
              <Text className="text-primary font-bold">Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-blue-600 border border-blue-400 py-3 rounded-xl items-center ml-2">
              <Text className="text-white font-bold">Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text className="text-lg font-bold text-textPrimary mb-3">Delegated To</Text>
        
        <View className="bg-white p-5 rounded-2xl border border-gray-200 mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-base font-bold text-textPrimary">SD Zones Strategy</Text>
            <Text className="text-sm text-textSecondary mt-1">Next epoch settlement: 12 days</Text>
          </View>
          <View className="bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <Text className="text-green-700 font-bold">Active</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
