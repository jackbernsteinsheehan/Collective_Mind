import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout() {
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);

  useEffect(() => {
    const checkSurveyCompletion = async () => {
      try {
        const surveyCompleted = await AsyncStorage.getItem('surveyCompleted') === 'true';
        setHasCompletedSurvey(surveyCompleted);
      } catch (error) {
        console.error('Error checking survey completion:', error);
      }
    };

    checkSurveyCompletion();
  }, []);

  // If survey is not completed, show stack navigation
  if (!hasCompletedSurvey) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="survey" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // If survey is completed, show tab navigation
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="survey" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
