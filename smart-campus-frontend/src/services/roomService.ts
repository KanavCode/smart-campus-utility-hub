import { timetableService } from './timetableService';
import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';

export const roomService = {
  getAll: async () => {
    const response = await timetableService.getRooms();
    return getPayloadArray<any>(response, 'rooms');
  },

  create: async (roomData: any) => {
    const response = await timetableService.createRoom(roomData);
    return getPayload<any>(response, 'room');
  },

  update: async (id: string, roomData: any) => {
    const { data } = await api.put(`/timetable/rooms/${id}`, roomData);
    return getPayload<any>(data, 'room');
  },

  delete: async (id: string) => {
    await api.delete(`/timetable/rooms/${id}`);
  },
};
