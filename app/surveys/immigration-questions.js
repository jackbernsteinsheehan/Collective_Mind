import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DebateQuestions() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'healthy_society',
      question: 'Immigration is necessary for a healthy society.',
      options: [
        { value: 'strongly_agree', label: 'Strongly agree' },
        { value: 'agree', label: 'Agree' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'disagree', label: 'Disagree' },
        { value: 'strongly_disagree', label: 'Strongly disagree' },
      ]
    },
    {
      id: 'immigrant_children',
      question: 'Young children brought illegally to the US should be treated as illegal immigrants.',
      options: [
        { value: 'strongly_agree', label: 'Strongly agree' },
        { value: 'agree', label: 'Agree' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'disagree', label: 'Disagree' },
        { value: 'strongly_disagree', label: 'Strongly disagree' },
      ]
    },

    {
      id: 'healthy_economy',
      question: 'Immigration is healthy for the US economy.',
      options: [
        { value: 'strongly_agree', label: 'Strongly agree' },
        { value: 'agree', label: 'Agree' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'disagree', label: 'Disagree' },
        { value: 'strongly_disagree', label: 'Strongly disagree' },
      ]
    }
  ];

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, proceed to matching
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      // Save debate preferences
      const userId = await AsyncStorage.getItem('userId');
      await AsyncStorage.setItem('debatePreferences', JSON.stringify(answers));
      console.log('Debate preferences saved:', answers);
      

      // Navigate to debate matching
      router.push('/debate-matching');
    } catch (error) {
      console.error('Error saving debate preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
    const response = await fetch(`http://192.168.50.88:5000/api/update/${userId}/immigration/views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        healthy_society: answers.healthy_society,
        immigrant_children: answers.immigrant_children,
        healthy_economy: answers.healthy_economy
      })
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnsweredCurrent = answers[currentQuestion.id];
  const canProceed = hasAnsweredCurrent;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debate Questions</Text>
        <Text style={styles.progress}>{currentQuestionIndex + 1} of {questions.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>

      {/* Question */}
      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  answers[currentQuestion.id] === option.value && styles.selectedOption
                ]}
                onPress={() => handleAnswer(currentQuestion.id, option.value)}
              >
                <Text style={[
                  styles.optionText,
                  answers[currentQuestion.id] === option.value && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handlePrevious}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[
            styles.navButton, 
            styles.primaryNavButton,
            !canProceed && styles.disabledButton
          ]} 
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.primaryNavButtonText}>
            {currentQuestionIndex === questions.length - 1 ? 'Find Partners' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  progress: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e1e1e1',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 30,
    lineHeight: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e1e1e1',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  navButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#fff',
  },
  primaryNavButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  navButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  primaryNavButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});