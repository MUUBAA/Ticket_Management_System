import api from './api';
import { Company } from '../types/company';

export const companyService = {

  async getCompanies(): Promise<Company[]> {

    const response = await api.get<{
      success: boolean;
      data: Company[];
    }>('/companies');

    return response.data;
  },
};