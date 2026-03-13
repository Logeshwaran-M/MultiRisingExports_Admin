import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

const Profile = () => {

  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    companyName: "",
    adminName: "",
    adminId: "",
    email: "",
    phone: "",
    address: "",
    website: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  /* FETCH PROFILE FROM FIREBASE */

  const fetchProfile = async () => {

    try {

      const docRef = doc(db, "admin_profile", "profile");

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {

        setProfile(docSnap.data());

      }

    } catch (error) {

      console.error("Profile fetch error:", error);

    }

  };

  const handleChange = (e) => {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });

  };

  /* SAVE PROFILE TO FIREBASE */

  const handleSave = async (e) => {

    e.preventDefault();

    try {

      await setDoc(doc(db, "admin_profile", "profile"), profile);

      setEditMode(false);

      alert("Profile updated successfully");

    } catch (error) {

      console.error("Update error:", error);

    }

  };

  return (

    <div className="container-fluid py-4">

      <div className="row justify-content-center">

        <div className="col-lg-8">

          <div className="card shadow border-0 rounded-4 p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <h4 className="fw-bold text-primary">
                👤 Admin Profile
              </h4>

              {!editMode && (

                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>

              )}

            </div>

            {/* VIEW MODE */}

            {!editMode && (

              <div className="profile-view">

                <p><b>Company Name:</b> {profile.companyName}</p>

                <p><b>Website:</b> {profile.website}</p>

                <hr />

                <p><b>Admin Name:</b> {profile.adminName}</p>

                <p><b>Admin ID:</b> {profile.adminId}</p>

                <p><b>Email:</b> {profile.email}</p>

                <p><b>Phone:</b> {profile.phone}</p>

                <p><b>Address:</b> {profile.address}</p>

              </div>

            )}

            {/* EDIT MODE */}

            {editMode && (

              <form onSubmit={handleSave}>

                <div className="mb-3">
                  <label className="fw-semibold">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={profile.companyName}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-semibold">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-semibold">Admin Name</label>
                  <input
                    type="text"
                    name="adminName"
                    value={profile.adminName}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-semibold">Admin ID</label>
                  <input
                    type="text"
                    name="adminId"
                    value={profile.adminId}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-semibold">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-semibold">Address</label>
                  <textarea
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="d-flex gap-2">

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      </div>

    </div>

  );

};

export default Profile;