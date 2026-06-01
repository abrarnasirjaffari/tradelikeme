import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-textPrimary">Settings</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Notifications</Text>
        <View className="bg-white rounded-2xl border border-gray-200 mb-6 overflow-hidden">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-base font-medium text-textPrimary">Push Notifications</Text>
            <Switch value={true} trackColor={{ true: '#3b82f6', false: '#d1d5db' }} />
          </View>
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-base font-medium text-textPrimary">Trade Executed</Text>
            <Switch value={true} trackColor={{ true: '#3b82f6', false: '#d1d5db' }} />
          </View>
          <View className="flex-row justify-between items-center p-4">
            <Text className="text-base font-medium text-textPrimary">Zone Approaching</Text>
            <Switch value={false} trackColor={{ true: '#3b82f6', false: '#d1d5db' }} />
          </View>
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Risk Management</Text>
        <View className="bg-white rounded-2xl border border-gray-200 mb-6 overflow-hidden">
          <TouchableOpacity className="flex-row justify-between items-center p-4">
            <View>
              <Text className="text-base font-medium text-textPrimary">Risk Mode</Text>
              <Text className="text-sm text-textSecondary mt-1">Currently set to Conservative</Text>
            </View>
            <Text className="text-xl text-gray-400">›</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity className="w-full bg-red-50 py-4 rounded-xl items-center mt-4 border border-red-100">
          <Text className="text-red-600 font-bold text-base">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
