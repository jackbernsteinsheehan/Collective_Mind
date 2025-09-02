import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Debates() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Debates</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Find Debate Partner Section */}
        <View style={styles.findPartnerSection}>
          <Text style={styles.sectionTitle}>Find Debate Partner</Text>
          <Text style={styles.sectionDescription}>
            Answer a few questions and get matched with someone who has opposite views
          </Text>
          <TouchableOpacity 
            style={styles.findPartnerButton}
            onPress={() => router.push('/immigration-questions')}
          >
            <Text style={styles.findPartnerButtonText}>Find Debate Partner</Text>
          </TouchableOpacity>
        </View>

        {/* Active Debates Section */}
        <View style={styles.activeDebatesSection}>
          <Text style={styles.sectionTitle}>Active Debates</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Climate Change</Text>
            <Text style={styles.cardDescription}>
              Is climate change primarily caused by human activity?
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.participants}>2 participants</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Debate</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Universal Healthcare</Text>
            <Text style={styles.cardDescription}>
              Should healthcare be a universal right?
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.participants}>3 participants</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Debate</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Free Speech on Social Media</Text>
            <Text style={styles.cardDescription}>
              Should social media platforms have the right to moderate content?
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.participants}>1 participant</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Debate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
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
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  findPartnerSection: {
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  findPartnerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  findPartnerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activeDebatesSection: {
    marginTop: 20,
  },
}); 