import "../css/header.css";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {

  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("admin");

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin-login");
  };

  return (
    <div className="admin-header shadow-sm px-4">

      <div className="d-flex justify-content-between align-items-center py-3">

        {/* Left Side */}
        <div>
          <h5 className="mb-0 fw-bold text-white">
            Welcome Back 👋
          </h5>
          <small className=" text-white">
            Multirising Exports Admin Panel
          </small>
        </div>

        {/* Right Side */}
        <div className="d-flex align-items-center text-white gap-4">

          {/* Notification */}
          <div className="notification position-relative">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </div>

          {/* Profile Section */}
          <div className="d-flex align-items-center gap-3 profile-section">

            {/* Avatar */}
            <div className="profile-avatar">
              {adminEmail?.charAt(0).toUpperCase()}
            </div>

            {/* Email */}
            <div>
              <div className="fw-semibold small">
                {adminEmail}
              </div>
              <small className="text-white">
                Admin
              </small>
            </div>

            {/* Logout */}
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Header;