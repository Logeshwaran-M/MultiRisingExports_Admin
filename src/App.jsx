import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./Components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Product";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Categories from "./pages/Category";
import AdminLogin from "./pages/AdminLogin";
import Profile from "./pages/Profile";
import Blog from "./pages/Blog";

/* Protect Admin Routes */

const ProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem("admin");

  if (!admin) {
    return <Navigate to="/admin-login" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected Admin Panel */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Profile />} />
             <Route path="blog" element={<Blog />} />
          <Route path="category" element={<Categories />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;