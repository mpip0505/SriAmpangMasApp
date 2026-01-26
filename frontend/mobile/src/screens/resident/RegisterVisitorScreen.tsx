import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { visitorService } from '../../services/visitorService';

export default function RegisterVisitorScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    visitor_ic_passport: '',
    vehicle_plate: '',
    purpose: '',
    expected_arrival: '',
    property_id: '650e8400-e29b-41d4-a716-446655440001', // Default property
  });

  const handleRegister = async () => {
    if (!formData.visitor_name) {
      Alert.alert('Error', 'Please enter visitor name');
      return;
    }
  
    setLoading(true);
    try {
      // Set arrival time to current time + 1 hour
      const arrivalTime = new Date();
      arrivalTime.setHours(arrivalTime.getHours() + 1);
  
      const response = await visitorService.register({
        ...formData,
        expected_arrival: arrivalTime.toISOString(),
      });
  
      Alert.alert(
        'Success!',
        `Visitor registered!\n\nQR Code: ${response.data.qr_code}`,
        [
          {
            text: 'View Details',
            onPress: () => navigation.navigate('VisitorDetails', { 
              visitor: response.data.visitor,
              qrCode: response.data.qr_code 
            }),
          },
          {
            text: 'Register Another',
            onPress: () => {
              setFormData({
                visitor_name: '',
                visitor_phone: '',
                visitor_ic_passport: '',
                vehicle_plate: '',
                purpose: '',
                expected_arrival: '',
                property_id: '650e8400-e29b-41d4-a716-446655440001',
              });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to register visitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Visitor</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Visitor Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter visitor name"
            value={formData.visitor_name}
            onChangeText={(text) => setFormData({ ...formData, visitor_name: text })}
            editable={!loading}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+60123456789"
            value={formData.visitor_phone}
            onChangeText={(text) => setFormData({ ...formData, visitor_phone: text })}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <Text style={styles.label}>IC/Passport</Text>
          <TextInput
            style={styles.input}
            placeholder="890101-02-1234"
            value={formData.visitor_ic_passport}
            onChangeText={(text) => setFormData({ ...formData, visitor_ic_passport: text })}
            editable={!loading}
          />

          <Text style={styles.label}>Vehicle Plate</Text>
          <TextInput
            style={styles.input}
            placeholder="ABC1234"
            value={formData.vehicle_plate}
            onChangeText={(text) => setFormData({ ...formData, vehicle_plate: text })}
            autoCapitalize="characters"
            editable={!loading}
          />

          <Text style={styles.label}>Purpose of Visit</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., Family visit, Delivery, etc."
            value={formData.purpose}
            onChangeText={(text) => setFormData({ ...formData, purpose: text })}
            multiline
            numberOfLines={3}
            editable={!loading}
          />

          <Text style={styles.note}>
            * Visitor will arrive shortly. QR code valid for 24 hours.
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Generate QR Code</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: '#667eea',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  note: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});