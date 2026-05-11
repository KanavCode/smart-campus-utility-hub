import { timetableService, PaginationSortParams } from './timetableService';
import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';
import { RoomFormData } from '@/types';

export const roomService = {
  getAll: async () => {
    const response = await timetableService.getRooms();
    return getPayloadArray(response, 'rooms');
  },

  list: async (params: PaginationSortParams) => {
    const response = await timetableService.getRooms('', params);
    return {
      items: getPayloadArray<any>(response, 'rooms'),
      total: (response?.data?.total as number) ?? 0,
      page: (response?.data?.page as number) ?? (params.page ?? 1),
      limit: (response?.data?.limit as number) ?? (params.limit ?? 20),
    };
  },

  create: async (roomData: any) => {
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
