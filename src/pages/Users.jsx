import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import "../css/users.css";

const Users = () => {

  const [users, setUsers] = useState([]);

  const getRoleClass = (role) => {
    return role === "Admin" ? "bg-danger" : "bg-success";
  };

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));

      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);

    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Remove user
  const handleRemove = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="users-page">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Users Management</h4>
          <small className="text-muted">
            Manage your platform users
          </small>
        </div>
      </div>

      {/* Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">

            <table className="table align-middle mb-0">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>

                    <td className="fw-semibold text-primary">
                      #{index + 1}
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <span className="fw-medium">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    <td className="text-muted">
                      {user.email}
                    </td>

                  

                    <td className="text-center">

                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        onClick={() => handleRemove(user.id)}
                      >
                        Remove
                      </button>

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Users;