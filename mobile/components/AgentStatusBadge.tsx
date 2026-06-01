import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AgentStatusBadge() {
  return (
    <View style={styles.container}>
      <Text>AgentStatusBadge Screen</Text>
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
