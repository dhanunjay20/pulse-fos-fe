import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../../components/ToastProvider";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [animateCard, setAnimateCard] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setAnimateCard(true);
    const loginTime = localStorage.getItem("loginTime");
    const now = Date.now();
    if (loginTime && now - parseInt(loginTime, 15) > 900000) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "https://pulse-766719709317.asia-south1.run.app/login",
        { username, password }
      );

      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", Date.now().toString());

      // Set role and employee info for navbar/route protection
      const role = response.data?.employeeRole?.toLowerCase(); // 'owner', 'manager', 'employee'
      localStorage.setItem("role", role);
      localStorage.setItem(
        "employee",
        JSON.stringify({
          name: response.data?.employeeName,
          id: response.data?.employeeId,
        })
      );

      showToast("Login successful!", "success");

      setTimeout(() => {
        switch (role) {
          case "employee":
            navigate("/dashboard/employee");
            break;
          case "manager":
            navigate("/dashboard/manager");
            break;
          case "owner":
            navigate("/dashboard/home");
            break;
          default:
            navigate("/login");
            break;
        }
      }, 2000);
    } catch (error) {
      setErrorMessage("Login failed. Please check your username and password.");
      showToast("Login failed. Invalid credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center">
      <div
        className={`card shadow w-100 login-card ${animateCard ? "fade-in" : ""}`}
        style={{ maxWidth: "500px", padding: "40px" }}
      >
        <h2 className="text-center mb-3">Welcome Back</h2>
        <p className="text-center text-muted">Please login to your account</p>

        <form onSubmit={handleSubmit} className="p-1">
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control form-control-lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-3 position-relative">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control form-control-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              title={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "10px",
                top: "38px",
                cursor: "pointer",
                fontSize: "1.2rem"
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <a href="#" className="text-decoration-none small">
              Forgot Username?
            </a>
            <a href="#" className="text-decoration-none small">
              Forgot Password?
            </a>
          </div>

          <div className="text-center mb-3">
            <span className="text-muted small">New here? </span>
            <Link to="/signup" className="text-decoration-none small fw-semibold">
              Create an account
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          {errorMessage && (
            <div className="text-danger text-center mt-2 small">{errorMessage}</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;