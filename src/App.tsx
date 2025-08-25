import { Route, Routes } from 'react-router-dom';
import MainRoutes from './Routes/mainRoutes';
import Login from './auth/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        {MainRoutes()}
      </Route>
    </Routes>
  );
}

export default App;

