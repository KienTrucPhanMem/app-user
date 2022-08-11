import { axiosClient } from './axiosClient';

export const getPassengerByPhone = async ({ phone }) => {
  return axiosClient.get(`/passengers/phone/${phone}`);
};
