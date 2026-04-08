import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../css/products.css";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY,
  },
});

const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit" | "details"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    image: "",
    description: "", // ✅ Added description
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (newProduct.image?.startsWith("blob:")) {
      return () => URL.revokeObjectURL(newProduct.image);
    }
  }, [newProduct.image]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };


  const filteredProducts = products.filter((product) => {
  const matchesSearch =
    product.name.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesCategory =
    filterCategory === "" || product.category === filterCategory;

  return matchesSearch && matchesCategory;
});

  // Fetch Products
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Stock Badge
  const getStockBadge = (stock) => {
    if (stock === 0) return "stock-out";
    if (stock <= 5) return "stock-low";
    return "stock-available";
  };

  // Input Change
 const handleChange = (e) => {
  const { name, value } = e.target;

  setNewProduct(prev => ({
    ...prev,
    [name]: value
  }));
};

  // Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setNewProduct({ ...newProduct, image: URL.createObjectURL(file) });
  };

  // Upload Image to S3
  const uploadImage = async () => {
    if (!imageFile) return "";
    const fileName = Date.now() + "_" + imageFile.name;
    const params = {
      Bucket: BUCKET_NAME,
      Key: "products/" + fileName,
      Body: await imageFile.arrayBuffer(),
      ContentType: imageFile.type,
    };
    await s3.send(new PutObjectCommand(params));
    return `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/products/${fileName}`;
  };

  // Add Product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const imageURL = await uploadImage();
      await addDoc(collection(db, "products"), {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        image: imageURL,
      });
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Update Product
  const handleUpdateProduct = async () => {
    try {
      let imageURL = newProduct.image;
      if (imageFile) {
        imageURL = await uploadImage();
      }
      await updateDoc(doc(db, "products", selectedProduct.id), {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        image: imageURL,
      });
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  // Open Details Modal
  const handleDetails = (product) => {
    setSelectedProduct(product);
    setModalType("details");
    setShowModal(true);
  };

  // Open Edit Modal
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setNewProduct({ ...product });
    setModalType("edit");
    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setNewProduct({ name: "", price: "", stock: "", category: "", image: "", description: "" });
    setImageFile(null);
    setSelectedProduct(null);
  };

  return (
    <div className="products-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Products</h4>
          <small className="text-white">Manage your store products</small>
        </div>
        <button
          className="add-btn"
          onClick={() => {
            setModalType("add");
            setShowModal(true);
          }}
        >
          + Add Product
        </button>
      </div>

      <div className="d-flex gap-3 mb-3">

  {/* Search */}
  <input
    type="text"
    className="form-control"
    placeholder="Search product..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  {/* Category Filter */}
  <select
    className="form-control"
    value={filterCategory}
    onChange={(e) => setFilterCategory(e.target.value)}
  >
    <option value="">All Categories</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.name}>
        {cat.name}
      </option>
    ))}
  </select>

</div>

      {/* Product Table */}
      <div className="card product-card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0 product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
           {  filteredProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td className="fw-semibold text-primary">#{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={product.image || "https://via.placeholder.com/45"}
                          alt="product"
                          className="product-img"
                        />
                        <span className="fw-medium text-dark">{product.name}</span>
                      </div>
                    </td>
                    <td className="text-dark">{product.category}</td>
                    <td className="fw-semibold text-dark">₹{product.price}</td>
                    <td>
                      <span className={`stock-badge ${getStockBadge(product.stock)}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-info rounded-pill px-3 me-2"
                        onClick={() => handleDetails(product)}
                      >
                        Details
                      </button>
                      <button
                        className="btn btn-sm btn-warning rounded-pill px-3 me-2"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal (Add/Edit/Details) */}
     <div className={`modal-overlay ${showModal ? "show" : "hide"}`}>
        <div className="modal-overlay">
          <div className="modal-box">
            {modalType === "details" && selectedProduct && (
              <>
                <h5 className="mb-3 fw-bold text-white">Product Details</h5>
                <img
                  src={selectedProduct.image || "https://via.placeholder.com/150"}
                  alt="product"
                  className="preview-img mb-3"
                />
                <p className="text-white"><strong>Name:</strong> {selectedProduct.name}</p>
                <p className="text-white"><strong>Category:</strong> {selectedProduct.category}</p>
                <p className="text-white"><strong>Price:</strong> ₹{selectedProduct.price}</p>
                <p className="text-white"><strong>Stock:</strong> {selectedProduct.stock}</p>
                <p className="text-white"><strong>Description:</strong> {selectedProduct.description}</p>
                <div className="d-flex justify-content-end">
                  <button className="btn btn-outline-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </>
            )}

            {(modalType === "add" || modalType === "edit") && (
              <>
                <h5 className="mb-3 fw-bold text-white">
                  {modalType === "add" ? "Add New Product" : "Edit Product"}
                </h5>

                <input
                  type="file"
                  className="form-control mb-3"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {newProduct.image && (
                  <img src={newProduct.image} alt="preview" className="preview-img mb-3" />
                )}

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Product Name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleChange}
                />

                <select
                  className="form-control mb-3"
                  name="category"
                  value={newProduct.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  className="form-control mb-3"
                  placeholder="Price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleChange}
                />

                <input
                  type="number"
                  className="form-control mb-3"
                  placeholder="Stock"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleChange}
                />

                {/* ✅ Description Field */}
                <textarea
                  className="form-control mb-3"
                  placeholder="Product Description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleChange}
                  rows={3}
                />

                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-outline-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={modalType === "add" ? handleAddProduct : handleUpdateProduct}
                  >
                    {modalType === "add" ? "Save Product" : "Update Product"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
    </div>
    </div>
  );
};

export default Products;