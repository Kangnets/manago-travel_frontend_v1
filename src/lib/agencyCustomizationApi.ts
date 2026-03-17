import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const customizationClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export type SupportedLanguage = 'ko' | 'en';

export interface AgencyCustomizationRecord<TSettings = Record<string, unknown>> {
  id: string;
  agencyId: string;
  slug: string;
  adminLanguage: SupportedLanguage;
  serviceLanguage: SupportedLanguage;
  settings: TSettings;
  created: string;
  updated: string;
}

export const agencyCustomizationAPI = {
  getMine: async <TSettings = Record<string, unknown>>() => {
    const response = await customizationClient.get<AgencyCustomizationRecord<TSettings> | null>(
      '/agency-customizations/me',
    );
    return response.data;
  },

  saveMine: async <TSettings extends object>(settings: TSettings) => {
    const response = await customizationClient.put<AgencyCustomizationRecord<TSettings>>(
      '/agency-customizations/me',
      { settings },
    );
    return response.data;
  },

  getBySlug: async <TSettings = Record<string, unknown>>(slug: string) => {
    const response = await customizationClient.get<AgencyCustomizationRecord<TSettings>>(
      `/agency-customizations/portal/${encodeURIComponent(slug)}`,
    );
    return response.data;
  },
};

export default agencyCustomizationAPI;
