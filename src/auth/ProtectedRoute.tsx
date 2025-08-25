// routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { selectAuth } from '../features/auth/authSlice';
import { useAppSelector } from '../hooks/ReduxHooks';

const ProtectedRoute = () => {
  const { token } = useAppSelector(selectAuth);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
