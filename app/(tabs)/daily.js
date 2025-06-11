import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';

export default function Daily() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Debate</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Today's Debate */}
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>Today's Topic</Text>
          <Text style={styles.todayTitle}>Social Media Regulation</Text>
          <Text style={styles.todayDescription}>
            Should social media platforms be more strictly regulated to prevent the spread of misinformation?
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>42%</Text>
              <Text style={styles.statLabel}>For</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>58%</Text>
              <Text style={styles.statLabel}>Against</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Today's Debate</Text>
          </TouchableOpacity>
        </View>

        {/* Previous Debates */}
        <Text style={styles.sectionTitle}>Previous Debates</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardDate}>Yesterday</Text>
          <Text style={styles.cardTitle}>Universal Basic Income</Text>
          <Text style={styles.cardDescription}>
            Would implementing a universal basic income improve society?
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.participants}>203 participants</Text>
            <Text style={styles.result}>65% For</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardDate}>2 days ago</Text>
          <Text style={styles.cardTitle}>Electric Vehicles</Text>
          <Text style={styles.cardDescription}>
            Should governments mandate a transition to electric vehicles?
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.participants}>178 participants</Text>
            <Text style={styles.result}>72% For</Text>
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
  todayCard: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  todayLabel: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  todayDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e1e1',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
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
  cardDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
  participants: {
    fontSize: 14,
    color: '#666',
  },
  result: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
}); 