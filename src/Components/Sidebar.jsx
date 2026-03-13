import { NavLink } from "react-router-dom";
import { FaHome, FaBox, FaShoppingCart, FaUsers, FaCog, FaTags, FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";
import "../css/sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger button for mobile */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div className={`sidebar p-4 ${isOpen ? "sidebar-open" : ""}`}>
        {/* Logo Section */}
        <div className="logo-container mb-4">
          <img
            src="/logo.png"
            alt="MultiRising Logo"
            className="sidebar-logo"
          />
        </div>

        <NavLink to="/" className="sidebar-link" onClick={() => setIsOpen(false)}>
          <FaHome /> Dashboard
        </NavLink>

        <NavLink to="/products" className="sidebar-link" onClick={() => setIsOpen(false)}>
          <FaBox /> Products
        </NavLink>

        <NavLink to="/category" className="sidebar-link" onClick={() => setIsOpen(false)}>
          <FaTags /> Categories
        </NavLink>

        <NavLink to="/orders" className="sidebar-link" onClick={() => setIsOpen(false)}>
          <FaShoppingCart /> Orders
        </NavLink>

        <NavLink to="/users" className="sidebar-link" onClick={() => setIsOpen(false)}>
          <FaUsers /> Users
        </NavLink>

        <NavLink to="/settings" className="sidebar-link" onClick={() => setIsOpen(false)}>
          <FaCog /> Profile
        </NavLink>
      </div>
    </>
  );
};

export default Sidebar;