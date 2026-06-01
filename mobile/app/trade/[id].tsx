import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TradeDetail() {
  return (
    <View style={styles.container}>
      <Text>TradeDetail Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
