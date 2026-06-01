import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TradeRow() {
  return (
    <View style={styles.container}>
      <Text>TradeRow Screen</Text>
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
