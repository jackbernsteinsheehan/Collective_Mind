import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DebateMatching() {
  const router = useRouter();
  const [debatePreferences, setDebatePreferences] = useState(null);
  const [potentialPartners, setPotentialPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebatePreferences();
    generateMockPartners();
  }, []);

  const loadDebatePreferences = async () => {
    try {
      const preferences = await AsyncStorage.getItem('debatePreferences');
      if (preferences) {
        setDebatePreferences(JSON.parse(preferences));
      }
    } catch (error) {
      console.error('Error loading debate preferences:', error);
    }
  };

  const generateMockPartners = () => {
    // Simulate finding potential partners with opposite views
    setTimeout(() => {
      const mockPartners = [
        {
          id: 'partner_1',
          name: 'Alex Chen',
          age: 28,
          location: 'San Francisco, CA',
          views: {
            climate_change: 'strongly_disagree',
            healthcare: 'strongly_disagree',
            social_media: 'strongly_disagree',
            immigration: 'strongly_disagree',
            gun_control: 'strongly_disagree',
          },
          compatibility: 95,
          lastActive: '2 minutes ago',
          bio: 'Political science graduate with strong conservative views. Always open to respectful debate.',
        },
        {
          id: 'partner_2',
          name: 'Sarah Johnson',
          age: 32,
          location: 'Austin, TX',
          views: {
            climate_change: 'disagree',
            healthcare: 'disagree',
            social_media: 'neutral',
            immigration: 'disagree',
            gun_control: 'strongly_disagree',
          },
          compatibility: 87,
          lastActive: '5 minutes ago',
          bio: 'Business consultant who enjoys discussing policy. Looking for thoughtful conversations.',
        },
        {
          id: 'partner_3',
          name: 'Michael Rodriguez',
          age: 25,
          location: 'Miami, FL',
          views: {
            climate_change: 'neutral',
            healthcare: 'disagree',
            social_media: 'agree',
            immigration: 'strongly_disagree',
            gun_control: 'disagree',
          },
          compatibility: 82,
          lastActive: '15 minutes ago',
          bio: 'Graduate student in economics. Passionate about free market principles.',
        },
      ];
      
      setPotentialPartners(mockPartners);
      setLoading(false);
    }, 2000); // Simulate network delay
  };

  const getViewLabel = (value) => {
    const labels = {
      'strongly_agree': 'Strongly Agree',
      'agree': 'Agree',
      'neutral': 'Neutral',
      'disagree': 'Disagree',
      'strongly_disagree': 'Strongly Disagree',
    };
    return labels[value] || value;
  };

  const getCompatibilityColor = (score) => {
    if (score >= 90) return '#28a745';
    if (score >= 80) return '#ffc107';
    if (score >= 70) return '#fd7e14';
    return '#dc3545';
  };

  const handleStartDebate = (partner) => {
    Alert.alert(
      'Start Debate',
      `Would you like to start a debate with ${partner.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Debate', 
          onPress: () => {
            // TODO: Implement actual debate creation
            Alert.alert('Debate Started', `Debate with ${partner.name} has been created!`);
          }
        },
      ]
    );
  };

  const handleRefresh = () => {
    setLoading(true);
    generateMockPartners();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Finding debate partners...</Text>
          <Text style={styles.loadingSubtext}>Analyzing your views and preferences</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Potential Partners</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.refreshButton}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Based on your views, we found {potentialPartners.length} potential debate partners</Text>
        <Text style={styles.summarySubtext}>
          These users have opposite or contrasting views on key issues, perfect for engaging debates
        </Text>
      </View>

      {/* Partners List */}
      <ScrollView style={styles.content}>
        {potentialPartners.map((partner) => (
          <View key={partner.id} style={styles.partnerCard}>
            {/* Partner Header */}
            <View style={styles.partnerHeader}>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerDetails}>
                  {partner.age} • {partner.location} • {partner.lastActive}
                </Text>
              </View>
              <View style={styles.compatibilityContainer}>
                <Text style={styles.compatibilityLabel}>Match</Text>
                <Text style={[
                  styles.compatibilityScore,
                  { color: getCompatibilityColor(partner.compatibility) }
                ]}>
                  {partner.compatibility}%
                </Text>
              </View>
            </View>

            {/* Partner Bio */}
            <Text style={styles.partnerBio}>{partner.bio}</Text>

            {/* View Comparison */}
            <View style={styles.viewsContainer}>
              <Text style={styles.viewsTitle}>View Comparison:</Text>
              {Object.entries(partner.views).map(([topic, view]) => (
                <View key={topic} style={styles.viewRow}>
                  <Text style={styles.viewTopic}>
                    {topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </Text>
                  <Text style={styles.viewValue}>{getViewLabel(view)}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => Alert.alert('Profile', `Viewing ${partner.name}'s profile`)}
              >
                <Text style={styles.secondaryButtonText}>View Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => handleStartDebate(partner)}
              >
                <Text style={styles.primaryButtonText}>Start Debate</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={() => router.push('/debate-questions')}
        >
          <Text style={styles.bottomButtonText}>Update My Views</Text>
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
  refreshButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#e0f7fa',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  summarySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  partnerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  partnerDetails: {
    fontSize: 14,
    color: '#666',
  },
  compatibilityContainer: {
    alignItems: 'center',
  },
  compatibilityLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  compatibilityScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  partnerBio: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 20,
  },
  viewsContainer: {
    marginBottom: 20,
  },
  viewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  viewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  viewTopic: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  viewValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomAction: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  bottomButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  bottomButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
