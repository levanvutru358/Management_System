// frontend/src/services/authService.ts
import api from "./api";
import { jwtDecode }  from "jwt-decode"; // Import rõ ràng từ jwt-decode

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterResponse {
  message: string;
  userId: number;
}

interface AuthResponse {
  access_token: string;
}

interface JwtPayload {
  sub: number;
  email: string;
  role: "admin" | "user";
}

export const register = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const login = async (
  data: LoginData
): Promise<{ user: User; token: string }> => {
  const response = await api.post("/auth/login", data);
  const token = response.data.access_token;
  localStorage.setItem("token", token);

  // Sử dụng jwtDecode và ép kiểu rõ ràng
  const decoded: JwtPayload = jwtDecode(token);
  const user: User = {
    id: decoded.sub,
    email: decoded.email,
    role: decoded.role,
    name: "",
  };

  return { user, token };
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem("token");
};

export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    // Sử dụng jwtDecode và ép kiểu rõ ràng
    const decoded: JwtPayload = jwtDecode(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: "",
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
