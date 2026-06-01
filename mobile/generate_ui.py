import os

base_dir = r"f:\AgentTeam\hackathon\Platform\mobile"

files = {
    "app/(auth)/login.tsx": """import React from 'react';
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
""",
    "app/(auth)/signup.tsx": """import React from 'react';
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
""",
    "app/(tabs)/trades.tsx": """import React from 'react';
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
      <View className="p-4 bg-white border-b border-gray-100 shadow-sm">
        <Text className="text-2xl font-bold text-textPrimary">Active Trades</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {activeTrades.map(trade => (
          <View key={trade.id} className="bg-white p-4 rounded-2xl border border-gray-200 mb-4 shadow-sm">
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
""",
    "app/(tabs)/vault.tsx": """import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Vault() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-100 shadow-sm">
        <Text className="text-2xl font-bold text-textPrimary">Your Vaults</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        <View className="bg-gradient-to-r from-primary to-secondary p-6 rounded-3xl mb-6 shadow-md shadow-blue-200">
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
        
        <View className="bg-white p-5 rounded-2xl border border-gray-200 mb-4 flex-row justify-between items-center shadow-sm">
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
""",
    "app/(tabs)/strategies.tsx": """import React from 'react';
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
      <View className="p-4 bg-white border-b border-gray-100 shadow-sm">
        <Text className="text-2xl font-bold text-textPrimary">Marketplace</Text>
        <Text className="text-textSecondary mt-1">Discover and follow top strategies</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {strategies.map(strat => (
          <TouchableOpacity key={strat.id} className="bg-white p-5 rounded-2xl border border-gray-200 mb-4 shadow-sm">
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
""",
    "app/(tabs)/settings.tsx": """import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-100 shadow-sm">
        <Text className="text-2xl font-bold text-textPrimary">Settings</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Notifications</Text>
        <View className="bg-white rounded-2xl border border-gray-200 mb-6 overflow-hidden shadow-sm">
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
        <View className="bg-white rounded-2xl border border-gray-200 mb-6 overflow-hidden shadow-sm">
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
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("UI content successfully generated.")
