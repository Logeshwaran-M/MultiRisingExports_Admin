import "../css/dashboard.css";
import { Package, ShoppingCart, Users, DollarSign, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const Dashboard = () => {
  const navigate = useNavigate();

  const [ordersCount, setOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      let totalOrders = 0;
      let totalRevenue = 0;

      for (const userDoc of usersSnapshot.docs) {
        const ordersRef = collection(db, "users", userDoc.id, "orders");
        const ordersSnapshot = await getDocs(ordersRef);

        totalOrders += ordersSnapshot.size;

        ordersSnapshot.forEach((orderDoc) => {
          const orderData = orderDoc.data();
          totalRevenue += Number(orderData.totalAmount || 0);
        });
      }

      setOrdersCount(totalOrders);
      setRevenue(totalRevenue);
      setUsersCount(usersSnapshot.size);

      const productsSnapshot = await getDocs(collection(db, "products"));
      setProductsCount(productsSnapshot.size);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  return (
    <div className="dashboard-card p-3">

      <h2 className="fw-bold mb-4 text-center text-md-start">Dashboard</h2>

      <div className="row g-3">

        {/* Orders */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card blue-card d-flex align-items-center p-3">
            <ShoppingCart size={30} className="me-2" />
            <div>
              <h6>Total Orders</h6>
              <h3>{ordersCount}</h3>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card green-card d-flex align-items-center p-3">
            <DollarSign size={30} className="me-2" />
            <div>
              <h6>Total Revenue</h6>
              <h3>₹{revenue}</h3>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card orange-card d-flex align-items-center p-3">
            <Package size={30} className="me-2" />
            <div>
              <h6>Total Products</h6>
              <h3>{productsCount}</h3>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card red-card d-flex align-items-center p-3">
            <Users size={30} className="me-2" />
            <div>
              <h6>Total Users</h6>
              <h3>{usersCount}</h3>
            </div>
          </div>
        </div>

        {/* Add Product */}
        <div className="col-12 col-sm-6 col-md-3">
          <div
            className="stat-card add-product-card d-flex align-items-center justify-content-center p-3"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/products")}
          >
            <Plus size={35} />
            <h6 className="ms-2 mb-0">Add Product</h6>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;