import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Survey() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const checkSurveyCompletion = async () => {
      try {
        const surveyCompleted = await AsyncStorage.getItem('surveyCompleted') === 'true';
        if (surveyCompleted) {
          console.log('Survey already completed, redirecting to tabs');
          router.replace('/(tabs)/home');
        }
      } catch (error) {
        console.error('Error checking survey completion:', error);
      }
    };

    checkSurveyCompletion();
  }, []);

  // Sample questions - replace with your actual survey questions
  const questions = [
    {
      id: 'political_spectrum',
      question: 'Where do you place yourself on the political spectrum?',
      options: [
        { value: 'far_left', label: 'Far Left' },
        { value: 'left', label: 'Left' },
        { value: 'center_left', label: 'Center-Left' },
        { value: 'center', label: 'Center' },
        { value: 'center_right', label: 'Center-Right' },
        { value: 'right', label: 'Right' },
        { value: 'far_right', label: 'Far Right' },
      ]
    },
    {
      id: 'economic_views',
      question: 'What best describes your economic views?',
      options: [
        { value: 'socialist', label: 'Socialist' },
        { value: 'progressive', label: 'Progressive' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'conservative', label: 'Conservative' },
        { value: 'libertarian', label: 'Libertarian' },
      ]
    },
    {
      id: 'social_views',
      question: 'What best describes your social views?',
      options: [
        { value: 'very_liberal', label: 'Very Liberal' },
        { value: 'liberal', label: 'Liberal' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'conservative', label: 'Conservative' },
        { value: 'very_conservative', label: 'Very Conservative' },
      ]
    }
  ];

  // Add this new function for testing the backend
  const testBackend = async () => {
    const testData = {
      user_id: "test_user_" + Date.now(), // Generate unique user ID
      political_spectrum: "left",
      economic_views: "progressive", 
      social_views: "liberal"
    };
    
    try {
      console.log('Testing Firebase backend with survey data:', testData);
      
      const response = await fetch('http://192.168.50.47:5000/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      const result = await response.json();
      console.log('Firebase backend response:', result);
      alert('Survey stored successfully in Firebase! Check console for details.');
      
    } catch (error) {
      console.error('Firebase backend test failed:', error);
      alert('Firebase backend test failed: ' + error.message);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Survey answers to be submitted:', answers);
      console.log('Survey answers JSON:', JSON.stringify(answers, null, 2));
      
      // Send data to backend API: changed to use mac IP
      const response = await fetch('http://192.168.50.47:5000/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Survey submitted successfully:', result);
        
        // Save survey answers locally as backup
        await AsyncStorage.setItem('surveyAnswers', JSON.stringify(answers));
        await AsyncStorage.setItem('surveyCompleted', 'true');
        
        // Navigate to the tabs section
        router.replace('/(tabs)/home');
      } else {
        console.error('Failed to submit survey to backend');
        // Still save locally as fallback
        await AsyncStorage.setItem('surveyAnswers', JSON.stringify(answers));
        await AsyncStorage.setItem('surveyCompleted', 'true');
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      console.error('Error saving survey data:', error);
      // Fallback to local storage
      await AsyncStorage.setItem('surveyAnswers', JSON.stringify(answers));
      await AsyncStorage.setItem('surveyCompleted', 'true');
      router.replace('/(tabs)/home');
    }
  };

  const currentQuestion = questions[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentStep + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                answers[currentQuestion.id] === option.value && styles.selectedOption
              ]}
              onPress={() => handleAnswer(currentQuestion.id, option.value)}
            >
              <Text 
                style={[
                  styles.optionText,
                  answers[currentQuestion.id] === option.value && styles.selectedOptionText
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add the test button here */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={testBackend}
        >
          <Text style={styles.testButtonText}>Test Firebase Storage</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.nextButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.nextButton,
              !answers[currentQuestion.id] && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === questions.length - 1 ? 'Submit' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e1e1e1',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  nextButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#e1e1e1',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  testButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 