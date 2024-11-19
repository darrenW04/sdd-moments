import { Stack } from 'expo-router';
import React from 'react';
import { Appearance } from 'react-native';

export default function RootLayout() {
  Appearance.setColorScheme('light');

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='signup' />
      <Stack.Screen name='login' />
      <Stack.Screen name='home' />

      <Stack.Screen name='index' />
      <Stack.Screen name='friends' />
      <Stack.Screen name='uploads' />
    </Stack>
  );
}
