import { axiosClient } from './axiosClient';

export const getDriverById = async ({ id }) => {
  return axiosClient.get(`/drivers/${id}`);
};
