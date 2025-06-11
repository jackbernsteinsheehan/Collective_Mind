import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function SurveyIntro() {
  const router = useRouter();

  const handleStartSurvey = () => {
    router.replace('/survey');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Your Survey</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            We'll ask you a few questions about your views and preferences to help us match you with the perfect debate partners.
          </Text>
          
          <Text style={styles.infoText}>
            This will only take a few minutes, and your answers will help create more meaningful discussions.
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>What to expect:</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>• 3 quick questions about your views</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>• Simple multiple-choice answers</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>• Takes about 2 minutes to complete</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStartSurvey}
      >
        <Text style={styles.startButtonText}>Start Survey</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 40,
  },
  infoText: {
    fontSize: 18,
    color: '#4a4a4a',
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#4a4a4a',
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    margin: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 