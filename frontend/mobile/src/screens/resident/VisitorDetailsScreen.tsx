import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function VisitorDetailsScreen({ route, navigation }: any) {
  const { visitor, qrCode } = route.params;

  const shareQRCode = async () => {
    try {
      await Share.share({
        message: `Your visitor pass for ${visitor.unit_number}, ${visitor.street}

Visitor: ${visitor.visitor_name}
QR Code: ${qrCode}
Valid until: ${new Date(visitor.qr_expires_at).toLocaleString()}

Show this code at the guardhouse.`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visitor Pass</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <QRCode value={qrCode} size={200} />
          </View>
          <Text style={styles.qrCode}>{qrCode}</Text>
          <Text style={styles.qrNote}>Show this QR code at the guardhouse</Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.sectionTitle}>Visitor Details</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name:</Text>
            <Text style={styles.rowValue}>{visitor.visitor_name}</Text>
          </View>

          {visitor.vehicle_plate && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Vehicle:</Text>
              <Text style={styles.rowValue}>{visitor.vehicle_plate}</Text>
            </View>
          )}

          {visitor.purpose && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Purpose:</Text>
              <Text style={styles.rowValue}>{visitor.purpose}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Address:</Text>
            <Text style={styles.rowValue}>
              {visitor.unit_number}, {visitor.street}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Valid Until:</Text>
            <Text style={styles.rowValue}>
              {new Date(visitor.qr_expires_at).toLocaleString()}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Status:</Text>
            <View style={[styles.badge, styles.badgePending]}>
              <Text style={styles.badgeText}>{visitor.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={shareQRCode}>
          <Text style={styles.shareButtonText}>📱 Share via WhatsApp/SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('ResidentHome')}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
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
  qrContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrBox: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  qrCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginTop: 16,
    letterSpacing: 2,
  },
  qrNote: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  details: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePending: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  shareButton: {
    backgroundColor: '#25D366',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#667eea',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});