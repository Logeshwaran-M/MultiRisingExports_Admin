import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Mail, Phone, MapPin, Package, ShoppingCart, Users } from "lucide-react";
import "../css/profile.css";

const Profile = () => {

  const [editMode, setEditMode] = useState(false);

  const [counts, setCounts] = useState({
    products: 0,
    orders: 0,
    users: 0
  });

  const [profile, setProfile] = useState({
    adminName: "",
    email: "",
    phone: "",
    address: ""
  });

 useEffect(() => {
  fetchProfile();
}, []);

  /* FETCH PROFILE */

const fetchProfile = async () => {

  const docRef = doc(db, "admin_profile", "profile");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {

    const data = docSnap.data();

    setProfile(data);

    fetchCounts(data.adminId); // pass adminId

  }

};
  /* FETCH COUNTS */
const fetchCounts = async () => {

  /* PRODUCTS COUNT */
  const productsSnap = await getDocs(collection(db, "products"));

  /* USERS COUNT */
  const usersSnap = await getDocs(collection(db, "users"));

  /* ORDERS COUNT FROM ALL USERS */

  let totalOrders = 0;

  for (const userDoc of usersSnap.docs) {

    const ordersRef = collection(db, "users", userDoc.id, "orders");

    const ordersSnap = await getDocs(ordersRef);

    totalOrders += ordersSnap.size;

  }

  setCounts({
    products: productsSnap.size,
    orders: totalOrders,
    users: usersSnap.size
  });

};


const handleChange = (e) => {
  setProfile({
    ...profile,
    [e.target.name]: e.target.value
  });
};

  const handleSave = async (e) => {

    e.preventDefault();

    await setDoc(doc(db, "admin_profile", "profile"), profile);

    setEditMode(false);

    alert("Profile Updated Successfully");

  };

  return (

    <div className="profile-container">

      {/* HEADER */}

      <div className="profile-header">

        <div className="profile-avatar-large">
          {profile.adminName?.charAt(0)}
        </div>

        <div>
          <h3>{profile.adminName || "Admin User"}</h3>
          <p className="text-white">Administrator</p>
        </div>

        {!editMode && (
          <button
            className="edit-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}

      </div>


      {/* INFO CARDS */}

      {!editMode && (

        <div className="profile-grid">

          <div className="profile-card">
            <Mail size={20}/>
            <div>
              <span  className="text-white">Email</span>
              <p  className="text-white">{profile.email}</p>
            </div>
          </div>

          <div className="profile-card">
            <Phone size={20}/>
            <div>
              <span  className="text-white">Phone</span>
              <p  className="text-white">{profile.phone}</p>
            </div>
          </div>

          <div className="profile-card">
            <MapPin size={20}/>
            <div>
              <span  className="text-white">Address</span>
              <p  className="text-white">{profile.address}</p>
            </div>
          </div>

        </div>

      )}


      {/* COUNTS */}

      {!editMode && (

        <div className="stats-grid text-white">

          <div className="stats-card">
            <Package size={22}/>
            <h2 >{counts.products}</h2>
            <p  className="text-white">Products</p>
          </div>

          <div className="stats-card">
            <ShoppingCart size={22}/>
            <h2>{counts.orders}</h2>
            <p  className="text-white">Orders</p>
          </div>

          <div className="stats-card">
            <Users size={22}/>
            <h2>{counts.users}</h2>
            <p  className="text-white">Users</p>
          </div>

        </div>

      )}


      {/* EDIT FORM */}

      {editMode && (

        <form className="profile-form" onSubmit={handleSave}>

          <input
            type="text"
            name="adminName"
            placeholder="Admin Name"
            value={profile.adminName}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={profile.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={profile.phone}
            onChange={handleChange}
          />

          <textarea
            name="address"
            placeholder="Address"
            value={profile.address}
            onChange={handleChange}
          />

          <div className="form-buttons">

            <button type="submit" className="save-btn">
              Save
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>

          </div>

        </form>

      )}

    </div>

  );

};

export default Profile;