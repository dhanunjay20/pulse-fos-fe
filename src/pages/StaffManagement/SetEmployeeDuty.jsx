import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../components/ToastProvider";

const dutyRoles = [
  "Petrol G1",
  "Petrol G2",
  "Diesel G1",
  "Diesel G2",
  "Petrol G1 & Diesel G1",
  "Petrol G2 & Diesel G2",
];

const SetEmployeeDuty = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [form, setForm] = useState({
    dutyRole: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("https://pulse-766719709317.asia-south1.run.app/active")
      .then((res) => {
        const filtered = res.data.filter(
          (emp) =>
            emp.active === true &&
            emp.employeeRole?.toUpperCase() === "EMPLOYEE"
        );
        setEmployees(filtered);
      })
      .catch(() => showToast("Failed to load employees", "error"));
  }, []);

  const handleEmpChange = (e) => {
    const emp = employees.find(
      (x) => String(x.employeeId) === String(e.target.value)
    );
    setSelectedEmp(emp || null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setSelectedEmp(null);
    setForm({ dutyRole: "", date: "", startTime: "", endTime: "" });
  };

  // Format milliseconds to hh:mm:ss
  const formatDuration = (ms) => {
    const hours = String(Math.floor(ms / (1000 * 60 * 60))).padStart(2, "0");
    const minutes = String(Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
    const seconds = String(Math.floor((ms % (1000 * 60)) / 1000)).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedEmp ||
      !form.dutyRole ||
      !form.date ||
      !form.startTime ||
      !form.endTime
    ) {
      showToast("Please fill all fields", "error");
      return;
    }
    setLoading(true);

    const loginTime = `${form.date}T${form.startTime}:00`;
    let logoutDate = form.date;
    if (form.endTime <= form.startTime) {
      const dateObj = new Date(form.date);
      dateObj.setDate(dateObj.getDate() + 1);
      logoutDate = dateObj.toISOString().slice(0, 10);
    }
    const logoutTime = `${logoutDate}T${form.endTime}:00`;

    const start = new Date(loginTime);
    const end = new Date(logoutTime);
    const diffMs = end - start;
    const timeAtWork = formatDuration(diffMs);

    const joinedDate = selectedEmp?.startDate || selectedEmp?.joinedDate || "";

    const payload = {
      employeeId: selectedEmp.employeeId,
      employeeName: `${selectedEmp.employeeFirstName} ${selectedEmp.employeeLastName}`,
      role: form.dutyRole,
      status: selectedEmp.active ? "Active" : "Inactive",
      loginTime,
      logoutTime,
      timeAtWork,
      joinedDate,
      date: form.date,
    };

    try {
      await axios.post("http://localhost:8080/api/staff", payload);
      showToast("Duty assigned successfully", "success");
      handleCancel();
    } catch {
      showToast("Failed to assign duty", "error");
    }
    setLoading(false);
  };

  return (
    <div className="inventory-bg">
      <div className="container inventory-container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                <h3 className="mb-0 fw-bold">🗓 Assign Employee Duty</h3>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Select Employee *</label>
                      <select
                        className="form-select form-control-lg"
                        name="employeeId"
                        value={selectedEmp?.employeeId || ""}
                        onChange={handleEmpChange}
                        required
                        style={{ height: "45px" }}
                      >
                        <option value="">Choose...</option>
                        {employees.map((emp) => (
                          <option key={emp.employeeId} value={emp.employeeId}>
                            {emp.employeeFirstName} {emp.employeeLastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Duty/Role *</label>
                      <select
                        className="form-select form-control-lg"
                        name="dutyRole"
                        value={form.dutyRole}
                        onChange={handleChange}
                        required
                        style={{ height: "45px" }}
                      >
                        <option value="">Select Duty</option>
                        {dutyRoles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Date *</label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        style={{ height: "45px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Start Time *</label>
                      <input
                        type="time"
                        className="form-control form-control-lg"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        required
                        style={{ height: "45px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">End Time *</label>
                      <input
                        type="time"
                        className="form-control form-control-lg"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleChange}
                        required
                        style={{ height: "45px" }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Assigning..." : "Assign Duty"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          .inventory-bg {
            min-height: 100vh;
          }
          .inventory-container {
            width: 98%;
            max-width: 100vw;
          }
          .inventory-card {
            border-radius: 1.25rem;
            overflow: hidden;
          }
          .bg-gradient-primary {
            background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
          }
        `}
      </style>
    </div>
  );
};

export default SetEmployeeDuty;