import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Referral() {
  return (
    <View style={styles.container}>
      <Text>Referral Screen</Text>
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
