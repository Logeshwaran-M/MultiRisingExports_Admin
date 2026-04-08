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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Orders = () => {

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    revenue: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;


  const exportOrders = () => {

  const data = filteredOrders.map((o) => ({
    OrderID: o.id,
    Customer: o.name,
    Email: o.email,
    Amount: o.amount,
    Status: o.status,
    Payment: o.payment,
    Type: o.type,
    Date: o.date
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const fileData = new Blob([excelBuffer]);

  saveAs(fileData, "orders.xlsx");

};
  // Fetch Orders
  const fetchOrders = async () => {

    try {

      const usersSnapshot = await getDocs(collection(db, "users"));

      let allOrders = [];

      for (const userDoc of usersSnapshot.docs) {

        const userData = userDoc.data();

        const ordersRef = collection(db, "users", userDoc.id, "orders");
        const ordersSnapshot = await getDocs(ordersRef);

        ordersSnapshot.forEach((orderDoc) => {

          const orderData = orderDoc.data();

          allOrders.push({
            id: orderDoc.id,
            userId: userDoc.id,
            name: userData.name || "User",
            email: userData.email || "",
            amount: orderData.totalAmount || 0,
            status: orderData.orderStatus || "Pending",
            payment: orderData.paymentStatus || "Pending",
            type: orderData.orderType || "India",
            createdAt: orderData.createdAt?.toDate() || new Date(),
            date: orderData.createdAt?.toDate().toLocaleDateString() || "",
            products: orderData.products || [],
            address: orderData.address || {}
          });

        });

      }

      // Sort newest first
      allOrders.sort((a, b) => b.createdAt - a.createdAt);

      setOrders(allOrders);
      setFilteredOrders(allOrders);

      // Calculate statistics
      let pending = 0;
      let delivered = 0;
      let revenue = 0;

      allOrders.forEach((o) => {

        if (o.status === "Pending") pending++;
        if (o.status === "Delivered") delivered++;

        revenue += Number(o.amount || 0);

      });

      setStats({
        total: allOrders.length,
        pending,
        delivered,
        revenue
      });

    } catch (error) {
      console.error("Error fetching orders:", error);
    }

  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Search + Filters
  useEffect(() => {

    let result = orders;

    if (search) {

      const q = search.toLowerCase();

      result = result.filter((o) =>
        o.name?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q)
      );

    }

    if (filter !== "All") {
      result = result.filter((o) => o.type === filter);
    }

    if (statusFilter !== "All") {
      result = result.filter((o) => o.status === statusFilter);
    }

    setFilteredOrders(result);

  }, [search, filter, statusFilter, orders]);

  // Pagination
  const indexLast = currentPage * ordersPerPage;
  const indexFirst = indexLast - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexFirst, indexLast);

  // Update Order
  const handleUpdate = async (userId, orderId, updatedFields) => {

    const orderRef = doc(db, "users", userId, "orders", orderId);

    await updateDoc(orderRef, updatedFields);

    fetchOrders();
    setShowEditModal(false);

  };

  // Delete Order
  const handleDelete = async (userId, orderId) => {

    if (!window.confirm("Delete this order?")) return;

    const orderRef = doc(db, "users", userId, "orders", orderId);

    await deleteDoc(orderRef);

    fetchOrders();

  };

  return (

    <div className="orders-page p-3">
 <div className="d-flex justify-content-between align-items-center mb-3">

  <h4 className="fw-bold mb-0">Orders Management</h4>

  <button
    className="btn btn-success"
    onClick={exportOrders}
  >
    Export Orders
  </button>

</div>
      <div className="row mb-4">

        <div className="col-md-3">
          <div className="card text-center shadow-sm p-3">
            <h6>Total Orders</h6>
            <h4 className="text-primary">{stats.total}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center shadow-sm p-3">
            <h6>Pending Orders</h6>
            <h4 className="text-warning">{stats.pending}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center shadow-sm p-3">
            <h6>Delivered</h6>
            <h4 className="text-success">{stats.delivered}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center shadow-sm p-3">
            <h6>Total Revenue</h6>
            <h4  className="text-success">₹{stats.revenue}</h4>
          </div>
        </div>

      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">

      

        <div className="d-flex gap-2 ">

          <input
            type="text"
            placeholder="Search orders..."
            className="form-control"
            style={{ width: "200px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="India">India Orders</option>
            <option value="International">International</option>
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

        </div>

      </div>

      {/* Table */}
      <div className="card shadow-sm bg-white">

        <div className="table-responsive">

          <table className="table align-middle">

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

              {currentOrders.map((order) => (

                <tr key={order.id}>

                  <td className="fw-semibold text-primary">{order.id}</td>

                  <td>
                    {order.name}
                    <br />
                    <small className="text-muted">{order.email}</small>
                  </td>

                  <td>{order.date}</td>

                  <td>
                    <span className="badge bg-info">{order.type}</span>
                  </td>

                  <td className="fw-semibold">₹{order.amount}</td>

                 <td>
  <span
    className={`badge 
      ${order.status === "Pending" ? "bg-warning text-dark" : ""}
      ${order.status === "Processing" ? "bg-info text-dark" : ""}
      ${order.status === "Shipped" ? "bg-primary" : ""}
      ${order.status === "Delivered" ? "bg-success" : ""}
      ${order.status === "Cancelled" ? "bg-danger" : ""}
    `}
  >
    {order.status}
  </span>

  <select
    className="form-select form-select-sm mt-2"
    value={order.status}
    onChange={(e) =>
      handleUpdate(order.userId, order.id, { orderStatus: e.target.value })
    }
  >
    <option>Pending</option>
    <option>Processing</option>
    <option>Shipped</option>
    <option>Delivered</option>
    <option>Cancelled</option>
  </select>
</td>
                 <td className="text-center">
  <div className="d-flex justify-content-center gap-2">

                    <button
                      className="btn  border"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowViewModal(true);
                      }}
                    >
                      <FaEye />
                    </button>

                    <button
                      className="btn  border"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="btn  border "
                      onClick={() =>
                        handleDelete(order.userId, order.id)
                      }
                    >
                      <FaTrash />
                    </button>
</div>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Pagination */}

      <div className="mt-3 text-center">

        {[...Array(Math.ceil(filteredOrders.length / ordersPerPage))].map(
          (_, i) => (

            <button
              key={i}
              className={`btn btn-sm mx-1 ${
                currentPage === i + 1 ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>

          )
        )}

      </div>

      {showViewModal && selectedOrder && (
  <div className="modal fade show d-block">
    <div className="modal-dialog modal-lg">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="text-dark">Order Details</h5>
          <button className="btn-close" onClick={() => setShowViewModal(false)} />
        </div>

        <div className="modal-body">
          <p><strong>Order ID:</strong> {selectedOrder.id}</p>
          <p><strong>Customer:</strong> {selectedOrder.name}</p>
          <p><strong>Email:</strong> {selectedOrder.email}</p>
          <p><strong>Status:</strong> {selectedOrder.status}</p>
          <p><strong>Total:</strong> ₹{selectedOrder.amount}</p>

          <hr />

          <h6>Products:</h6>
          {selectedOrder.products.map((p, i) => (
            <div key={i} className="d-flex justify-content-between">
              <span>{p.name}</span>
              <span>₹{p.price}</span>
            </div>
          ))}

          <hr />

          <h6>Address:</h6>
          <p>
            {selectedOrder.address?.addressLine1}, {selectedOrder.address?.city}
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
            Close
          </button>
        </div>

      </div>
    </div>
  </div>
)}

{showEditModal && selectedOrder && (
  <div className="modal fade show d-block">
    <div className="modal-dialog">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="text-dark">Edit Order</h5>
          <button className="btn-close" onClick={() => setShowEditModal(false)} />
        </div>

        <div className="modal-body">

          <label>Status</label>
          <select
            className="form-select"
            value={selectedOrder.status}
            onChange={(e) =>
              setSelectedOrder({
                ...selectedOrder,
                status: e.target.value,
              })
            }
          >
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>

        </div>

        <div className="modal-footer">
          <button
            className="btn btn-success"
            onClick={() =>
              handleUpdate(selectedOrder.userId, selectedOrder.id, {
                orderStatus: selectedOrder.status,
              })
            }
          >
            Save
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  </div>
)}

    </div>

  );

};

export default Orders;