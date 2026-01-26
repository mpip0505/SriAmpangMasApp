import api from './api';

export interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone?: string;
  visitor_ic_passport?: string;
  vehicle_plate?: string;
  purpose?: string;
  expected_arrival: string;
  expected_departure?: string;
  status: string;
  qr_code: string;
  unit_number: string;
  street: string;
  registered_by_name: string;
}

export interface RegisterVisitorData {
  visitor_name: string;
  visitor_phone?: string;
  visitor_ic_passport?: string;
  vehicle_plate?: string;
  purpose?: string;
  expected_arrival: string;
  expected_departure?: string;
  property_id: string;
}

export const visitorService = {
  register: async (data: RegisterVisitorData) => {
    const response = await api.post('/visitors', data);
    return response.data;
  },

  getMyVisitors: async () => {
    const response = await api.get('/visitors');
    return response.data;
  },

  getAllVisitors: async () => {
    const response = await api.get('/visitors');
    return response.data;
  },

  validateQR: async (qrCode: string) => {
    const response = await api.get(`/visitors/qr/${qrCode}`);
    return response.data;
  },

  checkIn: async (visitorId: string) => {
    const response = await api.post(`/visitors/${visitorId}/check-in`);
    return response.data;
  },

  checkOut: async (visitorId: string) => {
    const response = await api.post(`/visitors/${visitorId}/check-out`);
    return response.data;
  },
};