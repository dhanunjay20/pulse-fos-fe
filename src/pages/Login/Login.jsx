import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [animateCard, setAnimateCard] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setAnimateCard(true);
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
      setToastMessage("✅ Login successful!");
      setToastType("success");
      setToastVisible(true);

      setTimeout(() => {
        setToastVisible(false);
        navigate("/dashboard/home");
      }, 3000);
    } catch (error) {
      setErrorMessage("❌ Login failed. Please check your username and password.");
      setToastMessage("Login failed. Invalid credentials.");
      setToastType("error");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
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
            <Link to='/signup' className="text-decoration-none small fw-semibold">
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

      {/* Toast Notification */}
      <div className={`position-fixed top-0 end-0 p-3`} style={{ zIndex: 9999 }}>
        <div
          className={`toast align-items-center text-bg-${
            toastType === "success" ? "success" : "danger"
          } border-0 ${toastVisible ? "show" : "hide"}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">{toastMessage}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setToastVisible(false)}
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
