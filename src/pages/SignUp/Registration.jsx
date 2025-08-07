import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Registration.css";

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
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastMessage, setToastMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Password pattern validation
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordPattern.test(formData.password)) {
      setError("Password must include at least one uppercase letter, one number, and one special character.");
      return;
    }

    // Confirm password check
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

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
        setToastType("success");
        setToastMessage("🎉 Registration successful!");
        setToastVisible(true);
        setTimeout(() => {
          setToastVisible(false);
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError(err?.response?.data || "Registration failed.");
      setToastType("danger");
      setToastMessage("❌ Registration failed.");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
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
              <small className="text-muted">
                Must contain 1 capital letter, 1 number, and 1 special character.
              </small>
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
        </form>
      </div>

      {/* Toast */}
      <div className={`position-fixed top-0 end-0 p-3`} style={{ zIndex: 9999 }}>
        <div
          className={`toast align-items-center text-bg-${toastType} border-0 ${
            toastVisible ? "show" : "hide"
          }`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">{toastMessage}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setToastVisible(false)}
            ></button>
          </div>
          <div className="toast-progress-bar bg-light" />
        </div>
      </div>
    </div>
  );
}

export default Registration;
