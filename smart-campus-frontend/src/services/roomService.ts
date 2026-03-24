import { timetableService } from './timetableService';

const NOT_SUPPORTED_MESSAGE = 'Room update/delete is not available yet in the backend API.';

export const roomService = {
  getAll: async () => {
    const response = await timetableService.getRooms();
    return response?.data?.rooms || [];
  },

  create: async (roomData: any) => {
    const response = await timetableService.createRoom(roomData);
    return response?.data?.room;
  },

  update: async (_id: string, _roomData: any) => {
    throw new Error(NOT_SUPPORTED_MESSAGE);
  },

  delete: async (_id: string) => {
    throw new Error(NOT_SUPPORTED_MESSAGE);
  },
};
