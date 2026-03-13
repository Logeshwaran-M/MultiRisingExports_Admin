import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import "../css/layout.css";

const AdminLayout = () => {
  return (
    <div className="admin-container">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="admin-main">
        <Header />

        <div className="admin-content">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default AdminLayout;