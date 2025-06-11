import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userData, setUserData] = useState({
    username: 'JohnDoe',
    points: 0,
    hasCompletedSurvey: false
  });

  const [showSurveyPrompt, setShowSurveyPrompt] = useState(true);

  // Initialize user data and check survey completion
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        // Check if survey was completed in storage
        const surveyCompleted = await AsyncStorage.getItem('surveyCompleted') === 'true' || params.surveyCompleted === 'true';
        
        // Set initial user data
        setUserData({
          username: 'JohnDoe',
          points: 100,
          hasCompletedSurvey: surveyCompleted
        });

        // Only show survey prompt if survey is not completed
        setShowSurveyPrompt(!surveyCompleted);

        // If survey was just completed, save it to storage
        if (params.surveyCompleted === 'true') {
          await AsyncStorage.setItem('surveyCompleted', 'true');
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
      }
    };

    initializeUserData();
  }, [params.surveyCompleted]);

  const handleStartSurvey = () => {
    setShowSurveyPrompt(false);
    router.replace('/survey');
  };

  // If survey is completed, show the main home view
  if (userData.hasCompletedSurvey) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.username}>@{userData.username}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsLabel}>Points</Text>
              <Text style={styles.pointsValue}>{userData.points}</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.content}>
          <Text style={styles.welcomeText}>Welcome to Collective Mind</Text>
          
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/debates')}
            >
              <Text style={styles.quickActionText}>Find a Debate</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/daily')}
            >
              <Text style={styles.quickActionText}>Daily Debate</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Last Debate</Text>
            <Text style={styles.cardDescription}>
              Climate Change: Is it primarily caused by human activity?
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>2 days ago</Text>
              <Text style={styles.cardFooterText}>3 participants</Text>
            </View>
          </View>

          {/* Points History */}
          <Text style={styles.sectionTitle}>Points History</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Earnings</Text>
            <View style={styles.pointsHistory}>
              <View style={styles.pointsItem}>
                <Text style={styles.pointsItemLabel}>Won Debate</Text>
                <Text style={styles.pointsItemValue}>+50</Text>
              </View>
              <View style={styles.pointsItem}>
                <Text style={styles.pointsItemLabel}>Daily Participation</Text>
                <Text style={styles.pointsItemValue}>+25</Text>
              </View>
              <View style={styles.pointsItem}>
                <Text style={styles.pointsItemLabel}>Profile Completion</Text>
                <Text style={styles.pointsItemValue}>+100</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show survey prompt for new users
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>@{userData.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Points</Text>
            <Text style={styles.pointsValue}>{userData.points}</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Collective Mind</Text>
        <View style={styles.surveyPrompt}>
          <Text style={styles.surveyTitle}>Complete Your Profile</Text>
          <Text style={styles.surveyDescription}>
            To start debating, we need to understand your viewpoints. This helps us match you with people who have different perspectives.
          </Text>
          <TouchableOpacity 
            style={styles.surveyButton}
            onPress={handleStartSurvey}
          >
            <Text style={styles.surveyButtonText}>Start Survey</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Survey Prompt Modal */}
      <Modal
        visible={showSurveyPrompt}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Welcome to Collective Mind!</Text>
            <Text style={styles.modalText}>
              To get started with meaningful debates, we need to understand your viewpoints. This helps us match you with people who have different perspectives.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleStartSurvey}
            >
              <Text style={styles.modalButtonText}>Start Survey</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  pointsContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 14,
    color: '#666',
  },
  pointsHistory: {
    gap: 12,
  },
  pointsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  pointsItemLabel: {
    fontSize: 16,
    color: '#666',
  },
  pointsItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  surveyPrompt: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  surveyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  surveyDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  surveyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  surveyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 