import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";

export interface MyPayload {
  staffNo?: string;
  gender?: string;
  nickname?: string;
  approverID?: string; 
  staffName?:string;
}

export const useDecodedToken = (): MyPayload | null => {
  return useMemo(() => {
    try {
      const root = JSON.parse(localStorage.getItem("persist:auth") || "{}");
      if (!root) return null;

      const auth = JSON.parse(root.auth || "{}");
      const login = auth.login || {};

      return login?.token ? jwtDecode<MyPayload>(login.token) : null;
    } catch {
      return null;
    }
  }, []);
};
