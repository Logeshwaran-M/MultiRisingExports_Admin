import { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";

function AdminLogin() {

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const querySnapshot = await getDocs(collection(db, "admin"));

      let validAdmin = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.id === adminId && data.password === password) {
          validAdmin = true;
        }
      });

      if (validAdmin) {

        localStorage.setItem("admin", adminId);

        alert("Admin Login Successful");

        navigate("/");

      } else {

        alert("Invalid Admin Credentials");

      }

    } catch (error) {
      console.error(error);
      alert("Error logging in");
    }
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >

      <Container>

        <Card
          className="shadow-lg border-0 mx-auto"
          style={{
            maxWidth: "420px",
            borderRadius: "15px"
          }}
        >

          <Card.Body className="p-4">

            {/* Company Name */}

            <h2
              className="text-center fw-bold mb-2"
              style={{ color: "#2c5364" }}
            >
              Multirising Exports
            </h2>

            <p className="text-center text-muted mb-4">
              Admin Panel Login
            </p>

            <Form onSubmit={handleLogin}>

              {/* Admin ID */}

              <Form.Group className="mb-3">
                <Form.Label>Admin ID</Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Enter Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                />
              </Form.Group>

              {/* Password */}

              <Form.Group className="mb-4 position-relative">
                <Form.Label>Password</Form.Label>

                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "38px",
                    cursor: "pointer"
                  }}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>

              </Form.Group>

              {/* Login Button */}

              <Button
                type="submit"
                className="w-100 fw-semibold"
                style={{
                  background: "#2c5364",
                  border: "none",
                  padding: "10px"
                }}
              >
                Login to Dashboard
              </Button>

            </Form>

          </Card.Body>

        </Card>

      </Container>

    </div>
  );
}

export default AdminLogin;