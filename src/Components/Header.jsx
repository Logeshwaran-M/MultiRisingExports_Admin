import "../css/header.css";
import { Bell, Mail, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("admin");
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin-login");
  };

  return (
    <div className="admin-header shadow-sm px-4">
      <div className="d-flex justify-content-between align-items-center py-3">

        {/* Left Side */}
        <div className="d-none d-md-block">
          <h5 className="mb-0 fw-bold text-white">Welcome Back 👋</h5>
          <small className="text-white">Multirising Exports Admin Panel</small>
        </div>

        {/* Right Side */}
      <div className="d-flex align-items-center gap-3 position-relative ms-auto">

          {/* Notification */}
          <div className="notification position-relative">
            <Bell size={20} className="desktop-icon"/>
            <span className="notification-badge">3</span>
          </div>

          {/* Profile Section */}
          <div className="profile-section d-flex align-items-center position-relative">

            {/* Avatar */}
            <div
              className="profile-avatar"
              onClick={() => setShowMobileProfile(!showMobileProfile)}
            >
              {adminEmail?.charAt(0).toUpperCase()}
            </div>

            {/* Desktop Text + Logout */}
            <div className="d-none d-md-flex flex-column ms-2">
              <div className="fw-semibold small text-white">{adminEmail}</div>
              <small className="text-white">Admin</small>
            </div>

            <button
              className="logout-btn d-none d-md-block ms-2"
              onClick={handleLogout}
            >
              Logout
            </button>

            {/* Mobile Dropdown */}
            {showMobileProfile && (
              <div className="mobile-profile-dropdown d-md-none">
                <div className="mobile-profile-item">
                  <span className="mobile-email">{adminEmail}</span>
                  <Mail size={16} className="mobile-icon" />
                </div>
                <div className="mobile-profile-item mt-2">
                  <button className="logout-btn-mobile" onClick={handleLogout}>
                    Logout
                  </button>
                  <LogOut size={16} className="mobile-icon" />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;