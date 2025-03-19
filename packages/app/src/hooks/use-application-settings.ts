import { urls } from "@/lib/urls";
import { useLocalStorage } from "usehooks-ts";

// Type definitions for settings
export interface GeneralSettings {
  healthCheckInterval: number;
  healthcheckTimeout: number;
}

export interface ApiEndpoints {
  joystick: string;
  stream: string;
  stream_api: string;
  pocketbase: string;
  panel: string;
  baker: string;
  switcher: string;
  whisper: string;
}

// Storage keys
export const GENERAL_SETTINGS_KEY = "app_general_settings";
export const API_SETTINGS_KEY = "app_api_settings";

// Default settings
export const defaultGeneralSettings: GeneralSettings = {
  healthCheckInterval: 30,
  healthcheckTimeout: 10,
};

export const defaultApiSettings: ApiEndpoints = {
  joystick: urls.joystick,
  stream: urls.stream,
  stream_api: urls.stream_api,
  pocketbase: urls.pocketbase,
  panel: urls.panel,
  baker: urls.baker,
  switcher: urls.switcher,
  whisper: urls.whisper,
};

// Custom hook to manage application settings
export function useApplicationSettings() {
  // Use useLocalStorage hook to automatically handle reading and writing to localStorage
  const [generalSettings, setGeneralSettings] =
    useLocalStorage<GeneralSettings>(
      GENERAL_SETTINGS_KEY,
      defaultGeneralSettings
    );

  const [apiSettings, setApiSettings] = useLocalStorage<ApiEndpoints>(
    API_SETTINGS_KEY,
    defaultApiSettings
  );

  return {
    generalSettings,
    setGeneralSettings,
    apiSettings,
    setApiSettings,
  };
}
