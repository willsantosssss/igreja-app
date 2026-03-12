import React, { createContext, useReducer, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignout: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "RESTORE_TOKEN"; payload: { token: string | null; user: User | null } }
  | { type: "SIGN_IN"; payload: { token: string; user: User } }
  | { type: "SIGN_OUT" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isSignout: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isSignout: !action.payload.token,
      };
    case "SIGN_IN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isSignout: false,
        error: null,
      };
    case "SIGN_OUT":
      return {
        ...state,
        user: null,
        token: null,
        isSignout: true,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  apiBaseUrl: string;
}

export function AuthProvider({ children, apiBaseUrl }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore token on app launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userJson = await AsyncStorage.getItem("authUser");
        const user = userJson ? JSON.parse(userJson) : null;

        if (token && user) {
          // Verify token is still valid
          try {
            await axios.get(`${apiBaseUrl}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            dispatch({ type: "RESTORE_TOKEN", payload: { token, user } });
          } catch (error) {
            // Token is invalid, clear it
            await AsyncStorage.removeItem("authToken");
            await AsyncStorage.removeItem("authUser");
            dispatch({ type: "RESTORE_TOKEN", payload: { token: null, user: null } });
          }
        } else {
          dispatch({ type: "RESTORE_TOKEN", payload: { token: null, user: null } });
        }
      } catch (error) {
        console.error("[Auth] Error restoring token:", error);
        dispatch({ type: "RESTORE_TOKEN", payload: { token: null, user: null } });
      }
    };

    bootstrapAsync();
  }, [apiBaseUrl]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch({ type: "CLEAR_ERROR" });

        const response = await axios.post(`${apiBaseUrl}/api/auth/login`, {
          email,
          password,
        });

        const { app_session_id: token, user } = response.data;

        // Save token and user to AsyncStorage
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("authUser", JSON.stringify(user));

        dispatch({ type: "SIGN_IN", payload: { token, user } });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error || "Falha ao fazer login. Tente novamente.";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error;
      }
    },
    [apiBaseUrl]
  );

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint if needed
      if (state.token) {
        try {
          await axios.post(
            `${apiBaseUrl}/api/auth/logout`,
            {},
            { headers: { Authorization: `Bearer ${state.token}` } }
          );
        } catch (error) {
          console.warn("[Auth] Error calling logout endpoint:", error);
        }
      }

      // Clear local storage
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("authUser");

      dispatch({ type: "SIGN_OUT" });
    } catch (error) {
      console.error("[Auth] Error during logout:", error);
      dispatch({ type: "SIGN_OUT" });
    }
  }, [apiBaseUrl, state.token]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value: AuthContextType = {
    state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
