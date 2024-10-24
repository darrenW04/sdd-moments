import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="friends" />
      <Stack.Screen name="uploads" />
    </Stack>
  );
}
