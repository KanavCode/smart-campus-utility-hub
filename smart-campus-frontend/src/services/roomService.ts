import { timetableService } from './timetableService';
import { api } from '@/lib/axios';

export const roomService = {
  getAll: async () => {
    const response = await timetableService.getRooms();
    return response?.data?.rooms || [];
  },

  create: async (roomData: any) => {
    const response = await timetableService.createRoom(roomData);
    return response?.data?.room;
  },

  update: async (id: string, roomData: any) => {
    const { data } = await api.put(`/timetable/rooms/${id}`, roomData);
    return data?.data?.room;
  },

  delete: async (id: string) => {
    await api.delete(`/timetable/rooms/${id}`);
  },
};
