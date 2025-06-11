import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const router = useRouter();

  // Clear survey completion status on component mount
  useEffect(() => {
    const clearSurveyStatus = async () => {
      try {
        await AsyncStorage.removeItem('surveyCompleted');
        console.log('Survey completion status cleared');
      } catch (error) {
        console.error('Error clearing survey status:', error);
      }
    };
    clearSurveyStatus();
  }, []);

  const handleGetStarted = async () => {
    console.log('Get Started button pressed');
    try {
      const surveyCompleted = await AsyncStorage.getItem('surveyCompleted');
      console.log('Survey completed status:', surveyCompleted);
      
      if (surveyCompleted === 'true') {
        console.log('Navigating to tabs');
        router.replace('/(tabs)/home');
      } else {
        console.log('Navigating to login');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking survey completion:', error);
      console.log('Error occurred, navigating to login');
      router.push('/login');
    }
  };

  const steps = [
    {
      title: "Create an Account",
      description: "Join our community of open-minded individuals ready to engage in meaningful dialogue.",
      icon: "👤"
    },
    {
      title: "Complete the Survey",
      description: "Help us understand your views so we can match you with the perfect debate partner.",
      icon: "📝"
    },
    {
      title: "Ready to Debate!",
      description: "Get matched with someone who thinks differently and start expanding your perspective.",
      icon: "🎯"
    }
  ];

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderStep = (step, index) => (
    <View key={index} style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
      <View style={styles.stepContainer}>
        <Text style={styles.stepIcon}>{step.icon}</Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>Bridge the Divide</Text>
        <Text style={styles.subtitle}>Swipe to learn more</Text>
      </View>

      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="center"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          {steps.map((step, index) => renderStep(step, index))}
        </ScrollView>
      </View>

      <View style={styles.pagination}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  carouselContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
  },
  stepContainer: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center',
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
