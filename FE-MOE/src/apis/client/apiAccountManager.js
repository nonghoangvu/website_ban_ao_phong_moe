import { API_ROOT } from "~/utils/constants";
import authorizedAxiosInstance from "~/utils/authorizedAxios";



export const fetchAccountInfoById = async (id) => {
  return await authorizedAxiosInstance
    .get(`${API_ROOT}/accountManager/detailAccount/${id}`)
    .then((res) => res.data);
};

export const putAccountInfo = async (data, id) => {
  return await authorizedAxiosInstance.put(`${API_ROOT}/accountManager/updateAccount/${id}`, data);
};

export const postcustomerImage = async (data) => {
  return await authorizedAxiosInstance
    .post(`${API_ROOT}/customer/upload`, data)
    .then((res) => {
      return res.data.data
    });
};

  