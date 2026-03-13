import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import "../css/products.css"; // You can reuse the same CSS
import { setDoc } from "firebase/firestore";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  /* Fetch Categories */
  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(list);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* Add Category */
const handleAddCategory = async () => {
  if (!newCategory.trim()) {
    alert("Please enter category name");
    return;
  }

  try {
    // Add category to 'categories' collection
    const docRef = await addDoc(collection(db, "categories"), {
      name: newCategory,
      createdAt: new Date(),
    });

    // Create a sub-collection 'items' inside this category document
    await setDoc(doc(db, `categories/${docRef.id}/items`, "init"), {
      createdAt: new Date(),
      note: "Initial document"
    });

    fetchCategories();
    setShowModal(false);
    setNewCategory("");
  } catch (error) {
    console.error("Error adding category:", error);
  }
};

  /* Delete Category */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this category?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  return (
    <div className="products-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Categories</h4>
          <small className="text-muted">Manage your store categories</small>
        </div>

        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Category
        </button>
      </div>

      {/* Category Table */}
      <div className="card product-card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0 product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id}>
                    <td className="fw-semibold text-primary">#{index + 1}</td>
                    <td className="text-dark">{category.name}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5 className="mb-3 fw-bold">Add New Category</h5>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button className="btn btn-primary" onClick={handleAddCategory}>
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;