import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function GuardHomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Scan QR Code',
      subtitle: 'Verify visitor entry',
      icon: '📱',
      route: 'ScanQR',
      color: '#667eea',
    },
    {
      title: 'Validate Passcode',
      subtitle: 'Check delivery code',
      icon: '🔢',
      route: 'ValidatePasscode',
      color: '#f093fb',
    },
    {
      title: 'Expected Visitors',
      subtitle: 'View today\'s visitors',
      icon: '👥',
      route: 'ExpectedVisitors',
      color: '#4facfe',
    },
    {
      title: 'Expected Deliveries',
      subtitle: 'View today\'s deliveries',
      icon: '📦',
      route: 'ExpectedDeliveries',
      color: '#43e97b',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>On Duty</Text>
            <Text style={styles.name}>{user?.full_name}</Text>
            <Text style={styles.community}>{user?.community_name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.route)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2d3748',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  community: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  menu: {
    padding: 16,
  },
  menuItem: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
});