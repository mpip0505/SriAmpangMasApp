import api from './api';

export interface Delivery {
  id: string;
  delivery_service: string;
  vehicle_plate: string;
  estimated_arrival: string;
  passcode: string;
  status: string;
  unit_number: string;
  street: string;
  registered_by_name: string;
}

export interface RegisterDeliveryData {
  delivery_service: string;
  vehicle_plate: string;
  estimated_arrival: string;
  notes?: string;
}

export const deliveryService = {
  register: async (data: RegisterDeliveryData) => {
    const response = await api.post('/deliveries', data);
    return response.data;
  },

  getMyDeliveries: async () => {
    const response = await api.get('/deliveries/my');
    return response.data;
  },

  getAllDeliveries: async () => {
    const response = await api.get('/deliveries');
    return response.data;
  },

  validatePasscode: async (passcode: string) => {
    const response = await api.get(`/deliveries/passcode/${passcode}`);
    return response.data;
  },

  markCollected: async (passcode: string) => {
    const response = await api.post(`/deliveries/passcode/${passcode}/collected`);
    return response.data;
  },
};