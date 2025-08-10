import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../components/ToastProvider";
import "react-datepicker/dist/react-datepicker.css";

const SalesCollections = () => {
  const [entryDate, setEntryDate] = useState(new Date());
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeeFetchError, setEmployeeFetchError] = useState("");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [cashReceived, setCashReceived] = useState("");
  const [phonePay, setPhonePay] = useState("");
  const [creditCard, setCreditCard] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://pulse-766719709317.asia-south1.run.app/active")
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployeeFetchError("Failed to load employees."));
  }, []);

  useEffect(() => {
    axios
      .get("https://pulse-766719709317.asia-south1.run.app/products")
      .then((res) => {
        const activeProducts = res.data.filter(
          (p) => p.status && p.status.toUpperCase() === "ACTIVE"
        );
        setAllProducts(activeProducts);
      })
      .catch(() => showToast("Unable to load products", "error"));
  }, []);

  const handleAddProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        productId: "",
        productName: "",
        gun: "",
        opening: "",
        closing: "",
        price: "",
        testing: "",
        salesLiters: 0,
        salesRupees: 0,
        currentLevel: 0,
        tankCapacity: 0,
        refillSpace: 0,
        metric: "liters",
        error: "",
      },
    ]);
  };

  const handleRemoveProduct = (index) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const recalculateRow = (row) => {
    const opening = parseFloat(row.opening) || 0;
    const closing = parseFloat(row.closing) || 0;
    const testing = parseFloat(row.testing) || 0;
    const price = parseFloat(row.price) || 0;
    let liters = closing - opening - testing;
    if (liters < 0) liters = 0;

    if (liters > row.currentLevel) {
      row.error = `Sales (${liters.toFixed(2)} L) exceed current tank level (${row.currentLevel} L).`;
      row.salesLiters = 0;
      row.salesRupees = 0;
      return;
    }

    row.error = "";
    row.salesLiters = liters;
    row.salesRupees = parseFloat((liters * price).toFixed(2));
    row.refillSpace = Math.max((row.tankCapacity ?? 0) - (row.currentLevel - liters), 0);
  };

  const handleProductChange = async (index, field, value) => {
    const updated = [...products];
    const row = updated[index];
    row[field] = value;

    if (field === "productName") {
      const selectedProduct = allProducts.find((p) => p.productName === value);
      if (selectedProduct) {
        row.price = selectedProduct.price;
        row.productId = selectedProduct.productId;

        try {
          const invRes = await axios.get(
            "https://pulse-766719709317.asia-south1.run.app/inventory/latest"
          );
          const invProduct = invRes.data.find(
            (p) => p.productId === selectedProduct.productId
          );
          if (invProduct) {
            row.currentLevel = invProduct.currentLevel ?? 0;
            row.tankCapacity = invProduct.tankCapacity ?? 0;
            row.refillSpace =
              (invProduct.tankCapacity ?? 0) - (invProduct.currentLevel ?? 0);
            row.metric = invProduct.metric || "liters";
          }
        } catch {}
      }
    }

    if ((field === "productName" || field === "gun") && row.productName && row.gun) {
      try {
        const res = await axios.get(
          "https://pulse-766719709317.asia-south1.run.app/sales/last",
          {
            params: { productName: row.productName, gun: row.gun },
          }
        );
        row.opening = res.data.lastClosing || 0;
      } catch {
        showToast(`Error fetching last closing for ${row.productName} - ${row.gun}`, "error");
      }
    }

    recalculateRow(row);
    setProducts(updated);
  };

  const totalSales = products.reduce(
    (sum, p) => sum + (parseFloat(p.salesRupees) || 0),
    0
  );
  const totalCollection =
    (parseFloat(cashReceived) || 0) +
    (parseFloat(phonePay) || 0) +
    (parseFloat(creditCard) || 0);
  const shortCollections = (totalCollection - totalSales).toFixed(2);

  const formatDate = (date) => {
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!employeeId) {
      showToast("Please select employee", "error");
      setLoading(false);
      return;
    }

    if (products.some((p) => p.error)) {
      showToast("Fix errors before submitting", "error");
      setLoading(false);
      return;
    }

    if (parseFloat(shortCollections) < -10) {
      showToast("Short collections cannot be less than -10", "error");
      setLoading(false);
      return;
    }

    const payloadSales = {
      date: formatDate(entryDate),
      employeeId: parseInt(employeeId),
      products: products.map((p) => ({
        ...p,
        opening: parseFloat(p.opening) || 0,
        closing: parseFloat(p.closing) || 0,
        price: parseFloat(p.price) || 0,
        testing: parseFloat(p.testing) || 0,
        salesLiters: parseFloat(p.salesLiters) || 0,
        salesRupees: parseFloat(p.salesRupees) || 0,
      })),
    };

    const payloadCollections = {
      date: formatDate(entryDate),
      employeeId: parseInt(employeeId),
      cashReceived: parseFloat(cashReceived) || 0,
      phonePay: parseFloat(phonePay) || 0,
      creditCard: parseFloat(creditCard) || 0,
      shortCollections: parseFloat(shortCollections),
    };

    try {
      const inventoryUpdates = products.map((p) =>
        axios.post("https://pulse-766719709317.asia-south1.run.app/inventory", {
          productId: p.productId,
          quantity: -p.salesLiters,
          metric: p.metric,
          employeeId: parseInt(employeeId),
        })
      );

      await Promise.all([
        axios.post("https://pulse-766719709317.asia-south1.run.app/sales", payloadSales),
        axios.post(
          "https://pulse-766719709317.asia-south1.run.app/collections",
          payloadCollections
        ),
        ...inventoryUpdates,
      ]);

      showToast("Sales & Collections submitted successfully", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => window.location.reload(), 3000);
    } catch {
      showToast("Submission failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="inventory-bg">
      <div className="container inventory-container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                <h3 className="mb-0 fw-bold">
                  <span role="img" aria-label="sales">💰</span> Sales & Collections
                </h3>
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <div className="mb-3">
                      <label>Entry Date & Time</label>
                      <DatePicker
                        selected={entryDate}
                        onChange={setEntryDate}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd-MM-yyyy HH:mm"
                        maxDate={new Date()}
                        className="form-control form-control-lg"
                        required
                      />
                    </div>
                    <div>
                      <label>Employee</label>
                      <select
                        className="form-control form-control-lg"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        required
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.employeeId} value={emp.employeeId}>
                            {emp.employeeId} - {emp.employeeFirstName} {emp.employeeLastName}
                          </option>
                        ))}
                      </select>
                      {employeeFetchError && (
                        <small className="text-danger">{employeeFetchError}</small>
                      )}
                    </div>
                  </div>

                  {/* Sales Section */}
                  <h4 className="text-secondary mt-4 mb-3">Sales</h4>
                  {products.map((p, i) => (
                    <div className="row border rounded p-3 mb-4" key={i}>
                      {[
                        { label: "Product Name", field: "productName", type: "select" },
                        { label: "Gun", field: "gun", type: "select" },
                        { label: "Opening", field: "opening" },
                        { label: "Closing", field: "closing" },
                        { label: "Price", field: "price" },
                        { label: "Testing", field: "testing" },
                        { label: "Sales Liters", field: "salesLiters", readOnly: true },
                        { label: "Sales Rupees", field: "salesRupees", readOnly: true },
                        { label: "Current Level", field: "currentLevel", readOnly: true },
                        { label: "Refill Space", field: "refillSpace", readOnly: true },
                      ].map(({ label, field, type, readOnly }, j) => (
                        <div className="col-md-6 col-lg-4 mb-3" key={j}>
                          <label>{label}</label>
                          {type === "select" ? (
                            <select
                              className="form-control form-control-lg"
                              value={p[field]}
                              onChange={(e) => handleProductChange(i, field, e.target.value)}
                              required
                              disabled={readOnly}
                            >
                              <option value="">Select {label}</option>
                              {field === "productName"
                                ? allProducts.map((prod) => (
                                    <option key={prod.productId} value={prod.productName}>
                                      {prod.productName}
                                    </option>
                                  ))
                                : ["G1", "G2", "G3"].map((opt) => (
                                    <option key={opt}>{opt}</option>
                                  ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              className={`form-control form-control-lg ${
                                field === "closing" && p.error ? "is-invalid" : ""
                              }`}
                              value={p[field]}
                              onChange={(e) => handleProductChange(i, field, e.target.value)}
                              readOnly={readOnly}
                            />
                          )}
                          {field === "closing" && p.error && (
                            <div className="invalid-feedback">{p.error}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className="mb-4">
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={handleAddProduct}
                    >
                      Add Product
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveProduct(products.length - 1)}
                      disabled={products.length === 0}
                    >
                      Remove Last Product
                    </button>
                  </div>

                  {/* Collections Section */}
                  <h4 className="text-secondary mb-3">Collections</h4>
                  <div className="row">
                    {[
                      { label: "Cash Received", value: cashReceived, setter: setCashReceived },
                      { label: "Phone Pay", value: phonePay, setter: setPhonePay },
                      { label: "Credit Card", value: creditCard, setter: setCreditCard },
                      { label: "Total Collection", value: totalCollection.toFixed(2), readOnly: true },
                      { label: "Short Collections", value: shortCollections, readOnly: true },
                    ].map(({ label, value, setter, readOnly }, i) => (
                      <div className="col-md-6 col-lg-4 mb-3" key={i}>
                        <label>{label}</label>
                        <input
                          type="number"
                          className={`form-control form-control-lg ${
                            label === "Short Collections" &&
                            parseFloat(shortCollections) < -10
                              ? "is-invalid"
                              : ""
                          }`}
                          value={value}
                          onChange={(e) => setter?.(e.target.value)}
                          readOnly={readOnly}
                        />
                        {label === "Short Collections" &&
                          parseFloat(shortCollections) < -10 && (
                            <div className="invalid-feedback">
                              Short collections cannot be less than -10
                            </div>
                          )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleBack}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success" disabled={loading}>
                      {loading ? "Submitting..." : "Submit All"}
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
        .react-datepicker-wrapper,
        .react-datepicker__input-container input {
          width: 100%;
        }
        input[readonly],
        select[disabled],
        .form-control[readonly],
        .react-datepicker__input-container input[readonly] {
          background-color: #f5f5f5 !important;
          cursor: not-allowed !important;
        }
        `}
      </style>
    </div>
  );
};

export default SalesCollections;