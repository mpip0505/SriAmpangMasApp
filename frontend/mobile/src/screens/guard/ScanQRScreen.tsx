import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { visitorService } from '../../services/visitorService';

export default function ScanQRScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const handleBarCodeScanned = async ({ data }: any) => {
      if (scanned || loading) return;
  
      setScanned(true);
      setLoading(true);
  
      try {
        // Extract QR code from data (might be a URL or just the code)
        const qrCode = data.includes('/') ? data.split('/').pop() : data;
        
        console.log('Scanned QR:', qrCode);
  
        // Validate QR code
        const response = await visitorService.validateQR(qrCode);
        const visitor = response.data.visitor;
  
        // Show visitor details and check-in option
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
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                  );
                } catch (error: any) {
                  Alert.alert('Error', error.response?.data?.error || 'Check-in failed');
                  setScanned(false);
                  setLoading(false);
                }
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setScanned(false);
                setLoading(false);
              },
            },
          ]
        );
      } catch (error: any) {
        Alert.alert(
          'Invalid QR Code',
          error.response?.data?.error || 'QR code not found or expired',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setScanned(false);
                setLoading(false);
              },
            },
          ]
        );
      }
    };
  
    if (!permission) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      );
    }
  
    if (!permission.granted) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Camera permission is required to scan QR codes
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={requestPermission}
            >
              <Text style={styles.buttonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonSecondaryText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
  
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <SafeAreaView style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>← Back</Text>
              </TouchableOpacity>
            </View>
  
            <View style={styles.scanArea}>
              <View style={styles.scanBox}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.instruction}>
                {loading ? 'Validating...' : 'Position QR code within the frame'}
              </Text>
            </View>
  
            {scanned && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 20,
  },
  backButton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  buttonSecondaryText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
});