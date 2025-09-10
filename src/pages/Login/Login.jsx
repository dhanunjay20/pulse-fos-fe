import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../../components/ToastProvider";
import "./Login.css";
import loginImage from "../../assets/loginImage.svg";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [animateCard, setAnimateCard] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const controllerRef = useRef(null);

  useEffect(() => {
    setAnimateCard(true);

    // Fix: use radix 10 for decimal timestamps
    const loginTime = localStorage.getItem("loginTime");
    if (loginTime) {
      const last = parseInt(loginTime, 10);
      const now = Date.now();
      if (!Number.isNaN(last) && now - last > 15 * 60 * 1000) {
        // Session older than 15 minutes -> clear
        localStorage.clear();
        // No hard reload; this component is rendered on /login
      }
    }

    // Cleanup: abort any in-flight request if component unmounts
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Abort previous in-flight login (if any)
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch {}
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await axios.post(
        "https://pulse-620964158368.asia-south2.run.app/login",
        { username, password },
        {
          // Response timeout (ms)
          timeout: 8000,
          // Connection-level cancellation
          signal: controller.signal,
        }
      );

      // Persist minimal auth/session info
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", Date.now().toString());

      const role = response.data?.employeeRole?.toLowerCase() || "";
      localStorage.setItem("role", role);
      localStorage.setItem(
        "employee",
        JSON.stringify({
          name: response.data?.employeeName,
          id: response.data?.employeeId,
        })
      );

      showToast("Login successful!", "success");

      // Navigate immediately without the 2s delay; replace prevents back to /login
      switch (role) {
        case "employee":
          navigate("/dashboard/employee", { replace: true });
          break;
        case "manager":
          navigate("/dashboard/manager", { replace: true });
          break;
        case "owner":
          navigate("/dashboard/home", { replace: true });
          break;
        default:
          navigate("/login", { replace: true });
          break;
      }
    } catch (error) {
      // Friendly error messages
      if (axios.isCancel && axios.isCancel(error)) {
        setErrorMessage("Login request was canceled. Please try again.");
      } else if (error?.code === "ECONNABORTED") {
        setErrorMessage("Login timed out. Please check your connection and try again.");
      } else if (error?.name === "CanceledError") {
        setErrorMessage("Login request was canceled. Please try again.");
      } else if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Login failed. Please check your username and password.");
      }
      showToast("Login failed. Invalid credentials.", "error");
    } finally {
      setLoading(false);
      // Clear controller after completion
      controllerRef.current = null;
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-left">
          <img src={loginImage} alt="Login Illustration" className="login-image" />
        </div>
        <div className="login-right">
          <div className={`card shadow login-card ${animateCard ? "fade-in" : ""}`}>
            <h2 className="text-center mb-3">Welcome Pulse</h2>
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
                  autoComplete="username"
                  disabled={loading}
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
                  autoComplete="current-password"
                  disabled={loading}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setShowPassword((prev) => !prev);
                    }
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <a href="#" className="text-decoration-none small" aria-disabled={loading}>
                  Forgot Username?
                </a>
                <a href="#" className="text-decoration-none small" aria-disabled={loading}>
                  Forgot Password?
                </a>
              </div>
              <div className="text-center mb-3">
                <span className="text-muted small">New here? </span>
                <Link to="/signup" className="text-decoration-none small fw-semibold" aria-disabled={loading}>
                  Create an account
                </Link>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center"
                disabled={loading || !username || !password}
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
                <div className="text-danger text-center mt-2 small" role="alert">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
