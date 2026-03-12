import { useContext } from "react";
import { AuthContext } from "@/lib/auth-context";

export function useAuthEmail() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthEmail must be used within an AuthProvider");
  }
  return context;
}
