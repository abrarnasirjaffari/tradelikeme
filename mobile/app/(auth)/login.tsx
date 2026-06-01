import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

export default function Login() {
  return (
    <SafeAreaView className="flex-1 bg-white p-6 justify-center">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-textPrimary mb-2">Welcome Back</Text>
        <Text className="text-textSecondary text-base">Sign in to TradeLikeMe to continue</Text>
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
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>
      </View>
      
      <TouchableOpacity className="w-full bg-primary py-4 rounded-xl items-center mb-4">
        <Text className="text-white font-bold text-lg">Sign In</Text>
      </TouchableOpacity>
      
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="mx-4 text-textSecondary font-medium">OR</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>
      
      <TouchableOpacity className="w-full bg-black py-4 rounded-xl items-center flex-row justify-center mb-4">
        <Text className="text-white font-bold text-lg">Continue with Phantom</Text>
      </TouchableOpacity>
      
      <View className="flex-row justify-center mt-6">
        <Text className="text-textSecondary">Don't have an account? </Text>
        <Link href="/(auth)/signup" className="text-primary font-bold">Sign Up</Link>
      </View>
    </SafeAreaView>
  );
}
