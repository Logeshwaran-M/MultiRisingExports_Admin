import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../../firebase";
import { FaEye, FaTrash, FaEdit } from "react-icons/fa";
import "../css/orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch Orders
 const fetchOrders = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    let allOrders = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
       console.log("USER DATA:", userData);

      // Safely get user name
      const userName = [
        userData.name?.trim(),
      ].filter(Boolean).join(" ") || "User";

      const ordersRef = collection(db, "users", userDoc.id, "orders");
      const ordersSnapshot = await getDocs(ordersRef);

      ordersSnapshot.forEach((orderDoc) => {
        const orderData = orderDoc.data();
        allOrders.push({
          id: orderDoc.id,
          userId: userDoc.id,
          name: userData.name,  // exact name from user document
          email: userData.email || "",
          amount: orderData.totalAmount,
          status: orderData.orderStatus,
          payment: orderData.paymentStatus || "Pending",
          type: orderData.orderType,
          createdAt: orderData.createdAt?.toDate() || new Date(), // fallback to now
          date: orderData.createdAt?.toDate().toLocaleDateString() || "",
          products: orderData.products || [],
          address: orderData.address || {}
        });
      });
    }

    // Sort orders by createdAt descending (newest first)
    allOrders.sort((a, b) => b.createdAt - a.createdAt);

    setOrders(allOrders);
    setFilteredOrders(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};


  useEffect(() => {
    fetchOrders();
  }, []);

  // Search + Filter
  useEffect(() => {
    let result = orders;
    if (search) result = result.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));
    if (filter !== "All") result = result.filter((o) => o.type === filter);
    setFilteredOrders(result);
  }, [search, filter, orders]);

  // Update order status/payment
  const handleUpdate = async (userId, orderId, updatedFields) => {
    const orderRef = doc(db, "users", userId, "orders", orderId);
    await updateDoc(orderRef, updatedFields);
    fetchOrders();
    setShowEditModal(false);
  };

  // Delete order
  const handleDelete = async (userId, orderId) => {
    if (!window.confirm("Delete this order?")) return;
    const orderRef = doc(db, "users", userId, "orders", orderId);
    await deleteDoc(orderRef);
    fetchOrders();
  };

  return (
    <div className="orders-page p-3">

      {/* Header */}
      <div className="d-flex justify-content-between mb-4">
        <h4 className="fw-bold">Orders Management</h4>

        <div className="d-flex gap-3">
          <input
            type="text"
            placeholder="Search customer..."
            className="form-control"
            style={{ width: "200px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: "180px" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Orders</option>
            <option value="India">India Orders</option>
            <option value="International">International Orders</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="fw-semibold text-primary">{order.id}</td>
                  <td>
                    {order.name}
                    <br />
                    <small className="text-muted">{order.email}</small>
                  </td>
                  <td>{order.date}</td>
                  <td><span className="badge bg-info">{order.type}</span></td>
                  <td className="fw-semibold">₹{order.amount}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      onChange={(e) =>
                        handleUpdate(order.userId, order.id, { orderStatus: e.target.value })
                      }
                    >
                      <option className="status-pending ">Pending</option>
                      <option className="status-processing">Processing</option>
                      <option className="status-shipped">Shipped</option>
                      <option className="status-delivered">Delivered</option>
                      <option className="status-cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-light border" onClick={() => { setSelectedOrder(order); setShowViewModal(true); }}>
                      <FaEye />
                    </button>
                    <button className="btn btn-light border" onClick={() => { setSelectedOrder(order); setShowEditModal(true); }}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-light border text-danger" onClick={() => handleDelete(order.userId, order.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedOrder && (
        <div className="modal d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-4 bg-light">
              <h5 className="fw-bold mb-3 text-center">Order Details</h5>

              {/* Customer Info */}
              <div className="card mb-3 p-3 shadow-sm">
                <h6 className="fw-bold">Customer Info</h6>
                <p><b>Name:</b> {selectedOrder.name}</p>
                <p><b>Email:</b> {selectedOrder.email}</p>
                <p><b>Address:</b> {selectedOrder.address.address}, {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pinCode}</p>
                <p><b>Phone:</b> {selectedOrder.address.phone}</p>
              </div>

              {/* Products */}
              <div className="card mb-3 p-3 shadow-sm">
                <h6 className="fw-bold">Products</h6>
                {selectedOrder.products.map((p, i) => (
                  <div key={i} className="d-flex align-items-center mb-2">
                    <img src={p.image} alt="" width="60" className="me-3 rounded" />
                    <div>
                      <div className="fw-semibold">{p.name}</div>
                      <small>₹{p.price} × {p.quantity}</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="card p-3 shadow-sm mb-3">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Total Amount:</span>
                  <span className="fw-bold">₹{selectedOrder.amount}</span>
                </div>
                <div className="mt-2 d-flex justify-content-between">
                  <span><b>Status:</b></span>
                  <span>{selectedOrder.status}</span>
                </div>
                <div className="mt-2 d-flex justify-content-between">
                  <span><b>Payment:</b></span>
                  <span>{selectedOrder.payment}</span>
                </div>
              </div>

              <div className="text-end">
                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="modal d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-4" style={{ backgroundColor: "#f0f4f8" }}>
              <h5 className="fw-bold mb-3 text-center text-dark">Edit Order</h5>

              {/* Customer Info (Read Only) */}
              <div className="card mb-3 p-3 shadow-sm bg-white text-dark">
                <h6 className="fw-bold">Customer Info</h6>
                <p><b>Name:</b> {selectedOrder.name}</p>
                <p><b>Email:</b> {selectedOrder.email}</p>
                <p><b>Address:</b> {selectedOrder.address.address}, {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pinCode}</p>
                <p><b>Phone:</b> {selectedOrder.address.phone}</p>
              </div>

              {/* Update Fields */}
              <div className="card mb-3 p-3 shadow-sm bg-white">
                <h6 className="fw-bold">Update Status / Payment</h6>
                <div className="mb-3">
                  <label className="form-label"><b>Status</b></label>
                  <select className="form-select" value={selectedOrder.status} onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}>
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label"><b>Payment</b></label>
                  <select className="form-select" value={selectedOrder.payment} onChange={(e) => setSelectedOrder({ ...selectedOrder, payment: e.target.value })}>
                    <option>Paid</option>
                    <option>Pending</option>
                  </select>
                </div>

                <div className="text-end">
                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdate(selectedOrder.userId, selectedOrder.id, { orderStatus: selectedOrder.status, paymentStatus: selectedOrder.payment })}
                  >
                    Update
                  </button>
                  <button className="btn btn-secondary ms-2" onClick={() => setShowEditModal(false)}>Cancel</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;