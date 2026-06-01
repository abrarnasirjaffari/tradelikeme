import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

export default function Signup() {
  return (
    <SafeAreaView className="flex-1 bg-white p-6 justify-center">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-textPrimary mb-2">Create Account</Text>
        <Text className="text-textSecondary text-base">Join TradeLikeMe and start automating</Text>
      </View>
      
      <View className="space-y-4 mb-6">
        <View>
          <Text className="text-sm font-semibold text-textPrimary mb-1">Email</Text>
          <TextInput 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-textPrimary"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View className="mt-4">
          <Text className="text-sm font-semibold text-textPrimary mb-1">Password</Text>
          <TextInput 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-textPrimary"
            placeholder="Create a password"
            secureTextEntry
          />
        </View>
      </View>
      
      <TouchableOpacity className="w-full bg-primary py-4 rounded-xl items-center mb-4">
        <Text className="text-white font-bold text-lg">Sign Up</Text>
      </TouchableOpacity>
      
      <View className="flex-row justify-center mt-6">
        <Text className="text-textSecondary">Already have an account? </Text>
        <Link href="/(auth)/login" className="text-primary font-bold">Sign In</Link>
      </View>
    </SafeAreaView>
  );
}
