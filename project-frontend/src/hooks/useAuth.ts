import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setToken, clearToken } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  const login = (newToken: string) => {
    dispatch(setToken(newToken));
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    dispatch(clearToken());
    localStorage.removeItem('token');
  };

  return { token, isAuthenticated, login, logout };
};