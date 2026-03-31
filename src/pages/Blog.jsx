import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import "../css/blog.css"

const s3 = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY,
  },
});

const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME;

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedBlog, setSelectedBlog] = useState(null);

  const [newBlog, setNewBlog] = useState({
    heading: "",
    image: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);

  // Fetch Blogs
  const fetchBlogs = async () => {
    const snapshot = await getDocs(collection(db, "blog"));
    setBlogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Input Change
 const handleChange = (e) => {
  const { name, value } = e.target;

  setNewBlog(prev => ({
    ...prev,
    [name]: value
  }));
};

  // Image Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setNewBlog({ ...newBlog, image: URL.createObjectURL(file) });
  };

  // Upload Image
  const uploadImage = async () => {
    if (!imageFile) return "";
    const fileName = Date.now() + "_" + imageFile.name;

    const params = {
      Bucket: BUCKET_NAME,
      Key: "blogs/" + fileName,
      Body: await imageFile.arrayBuffer(),
      ContentType: imageFile.type,
    };

    await s3.send(new PutObjectCommand(params));

    return `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/blogs/${fileName}`;
  };

  // Add Blog
  const handleAddBlog = async () => {
    if (!newBlog.heading || !newBlog.description) {
      alert("Fill all fields");
      return;
    }

    try {
      const imageURL = await uploadImage();

      await addDoc(collection(db, "blog"), {
        ...newBlog,
        image: imageURL,
        createdAt: new Date(),
      });

      fetchBlogs();
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  // Update Blog
  const handleUpdateBlog = async () => {
    try {
      let imageURL = newBlog.image;

      if (imageFile) {
        imageURL = await uploadImage();
      }

      await updateDoc(doc(db, "blog", selectedBlog.id), {
        ...newBlog,
        image: imageURL,
      });

      fetchBlogs();
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  // Delete Blog
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    await deleteDoc(doc(db, "blog", id));
    fetchBlogs();
  };

 const handleEdit = (blog) => {
  setSelectedBlog(blog);

  setNewBlog({
    heading: blog.heading || "",
    image: blog.image || "",
    description: blog.description || ""
  });

  setModalType("edit");
  setShowModal(true);
};

  const handleDetails = (blog) => {
    setSelectedBlog(blog);
    setModalType("details");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewBlog({ heading: "", image: "", description: "" });
    setImageFile(null);
    setSelectedBlog(null);
  };

  return (
    <div className="products-page">
      <div className="d-flex justify-content-between mb-3">
        <h4>Blogs</h4>
        <button onClick={() => { setModalType("add"); setShowModal(true); }}>
          + Add Blog
        </button>
      </div>

      {/* Blog Table */}
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Heading</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog, i) => (
            <tr key={blog.id}>
              <td>{i + 1}</td>
              <td>
                <img src={blog.image} width="60" />
              </td>
              <td>{blog.heading}</td>
              <td>
                <button onClick={() => handleDetails(blog)}>View</button>
                <button onClick={() => handleEdit(blog)}>Edit</button>
                <button onClick={() => handleDelete(blog.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            {modalType === "details" && selectedBlog && (
              <>
                <h4>{selectedBlog.heading}</h4>
                <h4>Image</h4>
                <img src={selectedBlog.image} width="100%" />
                <h4>Description</h4>
                <p className="text-light">{selectedBlog.description}</p>
                <button onClick={closeModal}>Close</button>
              </>
            )}

            {(modalType === "add" || modalType === "edit") && (
              <>
              <div className="text-center">
                <h3>Add Blogs</h3>
              </div>
                <input type="file" onChange={handleImageChange} />
                {newBlog.image && <img src={newBlog.image} width="100" />}

                <input
                  type="text"
                  placeholder="Heading"
                  name="heading"
                  value={newBlog.heading}
                  onChange={handleChange}
                />

                <textarea
                  placeholder="Description"
                  name="description"
                  value={newBlog.description}
                  onChange={handleChange}
                />

                <button onClick={closeModal}>Cancel</button>
                <button onClick={modalType === "add" ? handleAddBlog : handleUpdateBlog}>
                  Save
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;