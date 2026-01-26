import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { visitorService } from '../../services/visitorService';

export default function ManualQRScreen({ navigation }: any) {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!qrCode.trim()) {
      Alert.alert('Error', 'Please enter QR code');
      return;
    }

    setLoading(true);
    try {
      const response = await visitorService.validateQR(qrCode.trim());
      const visitor = response.data.visitor;

      Alert.alert(
        'Valid QR Code ✅',
        `Visitor: ${visitor.visitor_name}\nFor: ${visitor.registered_by_name}\nAddress: ${visitor.unit_number}, ${visitor.street}\nVehicle: ${visitor.vehicle_plate || 'N/A'}`,
        [
          {
            text: 'Check In',
            onPress: async () => {
              try {
                await visitorService.checkIn(visitor.id);
                Alert.alert(
                  'Success',
                  `${visitor.visitor_name} checked in successfully!`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setQrCode('');
                        navigation.goBack();
                      },
                    },
                  ]
                );
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.error || 'Check-in failed');
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Invalid QR Code',
        error.response?.data?.error || 'QR code not found or expired'
      );
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
        <Text style={styles.headerTitle}>Enter QR Code</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>QR Code</Text>
        <TextInput
          style={styles.input}
          placeholder="VIS-XXXXXXXXXXXXXXXX"
          value={qrCode}
          onChangeText={setQrCode}
          autoCapitalize="characters"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleValidate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Validate</Text>
          )}
        </TouchableOpacity>
      </View>
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
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#2d3748',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
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