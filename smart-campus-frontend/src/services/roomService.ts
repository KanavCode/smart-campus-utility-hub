import { timetableService } from './timetableService';
import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';
import { RoomFormData } from '@/types';

export const roomService = {
  getAll: async () => {
    const response = await timetableService.getRooms();
    return getPayloadArray(response, 'rooms');
  },

  create: async (roomData: RoomFormData) => {
    const response = await timetableService.createRoom(roomData);
    return getPayload(response, 'room');
  },

  update: async (id: string, roomData: RoomFormData) => {
    const { data } = await api.put(`/timetable/rooms/${id}`, roomData);
    return getPayload(data, 'room');
  },

  delete: async (id: string) => {
    await api.delete(`/timetable/rooms/${id}`);
  },
};
