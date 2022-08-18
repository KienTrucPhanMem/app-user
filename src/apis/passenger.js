import { axiosClient } from './axiosClient';

export const getPassengerByPhone = async ({ phone }) => {
  return axiosClient.get(`/passengers/phone/${phone}`);
};

export const updateFCMToken = async ({ id, token }) => {
  return axiosClient.put(`/passengers/${id}`, { FCM_token: token });
};

export const booking = async (data) => {
  return axiosClient.post(`/drivers/booking`, data);
};
