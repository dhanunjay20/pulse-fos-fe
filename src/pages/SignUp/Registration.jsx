import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../components/ToastProvider";
import "./Registration.css";
import loginImage from "../../assets/loginImage.svg";

function Registration() {
  const [formData, setFormData] = useState({
    employeeFirstName: "",
    employeeLastName: "",
    employeePhoneNumber: "",
    employeeEmail: "",
    employeeRole: "",
    username: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [animateCard, setAnimateCard] = useState(false);
  const [passwordPatternError, setPasswordPatternError] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    setAnimateCard(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      setPasswordPatternError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordPattern.test(formData.password)) {
      setPasswordPatternError(true);
      setError("");
      showToast("Password must include at least one uppercase letter, one number, and one special character.", "error");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      setPasswordPatternError(false);
      showToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setPasswordPatternError(false);

    const payload = {
      ...formData,
      employeeSalary: 0,
      isActive: true,
      startDate: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await axios.post(
        "https://pulse-766719709317.asia-south1.run.app/employee",
        payload
      );
      if (response.status === 200) {
        setSuccess("Registration successful!");
        showToast("🎉 Registration successful!", "success");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err?.response?.data || "Registration failed.");
      showToast("❌ Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-bg">
      <div className="registration-container">
        <div className="registration-left">
          <img src={loginImage} alt="Registration Illustration" className="registration-image" />
        </div>
        <div className="registration-right">
          <div className={`registration-card ${animateCard ? "fade-in" : ""}`}>
            <h2 className="text-center mb-3">Employee Registration</h2>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="employeeFirstName"
                    value={formData.employeeFirstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="employeeLastName"
                    value={formData.employeeLastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="employeePhoneNumber"
                    value={formData.employeePhoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="employeeEmail"
                    value={formData.employeeEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    name="employeeRole"
                    value={formData.employeeRole}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Owner">Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password</label>
                  <input
                    type="text"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {passwordPatternError && (
                    <div className="text-danger mt-1" style={{ fontSize: "0.95em" }}>
                      Password must include at least one uppercase letter, one number, and one special character.
                    </div>
                  )}
                </div>
                <div className="col-md-6 position-relative">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              {error && <div className="text-danger mt-3 text-center">{error}</div>}
              {success && <div className="text-success mt-3 text-center">{success}</div>}

              <button
                type="submit"
                className="btn btn-primary w-100 mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </button>
              <div className="text-center mt-3">
                <span className="text-muted small">Already have an account? </span>
                <Link to="/login" className="text-decoration-none small fw-semibold">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;