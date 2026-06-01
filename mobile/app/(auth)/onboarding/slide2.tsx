import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OnboardingSlide2() {
  return (
    <View style={styles.container}>
      <Text>OnboardingSlide2 Screen</Text>
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
