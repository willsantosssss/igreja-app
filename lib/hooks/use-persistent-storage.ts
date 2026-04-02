import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Cross-platform persistent storage hook
 * - Uses AsyncStorage on native (React Native)
 * - Uses localStorage on web (browser)
 */
export const usePersistentStorage = () => {
  const getItem = async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`[Storage] Error getting item ${key}:`, error);
      return null;
    }
  };

  const setItem = async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`[Storage] Error setting item ${key}:`, error);
    }
  };

  const removeItem = async (key: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage] Error removing item ${key}:`, error);
    }
  };

  const clear = async (): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        localStorage.clear();
        return;
      }
      await AsyncStorage.clear();
    } catch (error) {
      console.error("[Storage] Error clearing storage:", error);
    }
  };

  return { getItem, setItem, removeItem, clear };
};
