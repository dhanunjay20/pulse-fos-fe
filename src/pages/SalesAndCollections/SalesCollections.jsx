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
      .get("http://localhost:8080/active")
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployeeFetchError("Failed to load employees."));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/products")
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
        salesLiters: "0.00",
        salesRupees: "0.00",
        currentLevel: "0.00",
        tankCapacity: "0.00",
        refillSpace: "0.00",
        metric: "Liters (Sale)",
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
    liters = Math.max(liters, 0);

    if (liters > (parseFloat(row.currentLevel) || 0)) {
      row.error = `Sales (${liters.toFixed(2)} L) exceed current tank level (${Number(row.currentLevel).toFixed(2)} L).`;
      row.salesLiters = "0.00";
      row.salesRupees = "0.00";
      return;
    }

    row.error = "";
    row.salesLiters = liters.toFixed(2);
    row.salesRupees = (liters * price).toFixed(2);
    row.refillSpace = Math.max((parseFloat(row.tankCapacity) || 0) - ((parseFloat(row.currentLevel) || 0) - liters), 0).toFixed(2);
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
          const invRes = await axios.get("http://localhost:8080/inventory/latest");
          const invProduct = invRes.data.find(
            (p) => p.productId === selectedProduct.productId
          );
          if (invProduct) {
            row.currentLevel = Number(invProduct.currentLevel ?? 0).toFixed(2);
            row.tankCapacity = Number(invProduct.tankCapacity ?? 0).toFixed(2);
            row.refillSpace =
              (Number(invProduct.tankCapacity ?? 0) - Number(invProduct.currentLevel ?? 0)).toFixed(2);
            row.metric = invProduct.metric || "Liters (Sale)";
          } else {
            row.currentLevel = "0.00";
            row.tankCapacity = "0.00";
            row.refillSpace = "0.00";
            row.metric = "Liters (Sale)";
          }
        } catch {
          row.currentLevel = "0.00";
          row.tankCapacity = "0.00";
          row.refillSpace = "0.00";
          row.metric = "Liters (Sale)";
        }
      }
    }

    if ((field === "productName" || field === "gun") && row.productName && row.gun) {
      try {
        const res = await axios.get("http://localhost:8080/sales/last", {
          params: { productName: row.productName, gun: row.gun },
        });
        row.opening = Number(res.data.lastClosing || 0).toFixed(2);
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
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!employeeId) {
      showToast("Please select employee", "error");
      setLoading(false);
      return;
    }
    if (products.length === 0) {
      showToast("Add at least one product", "error");
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
    if (
      products.some(
        (p) =>
          !p.productId ||
          !p.productName ||
          !p.gun ||
          isNaN(parseFloat(p.opening)) ||
          isNaN(parseFloat(p.closing)) ||
          isNaN(parseFloat(p.price))
      )
    ) {
      showToast("Fill all product fields", "error");
      setLoading(false);
      return;
    }

    const payload = {
      entrySaleData: {
        date: formatDate(entryDate),
        employeeId: parseInt(employeeId),
        products: products.map((p) => ({
          productName: p.productName,
          gun: p.gun,
          opening: parseFloat(p.opening) || 0,
          closing: parseFloat(p.closing) || 0,
          testing: parseFloat(p.testing) || 0,
          price: parseFloat(p.price) || 0,
        })),
      },
      entryCollectionData: {
        date: formatDate(entryDate),
        employeeId: parseInt(employeeId),
        cashReceived: parseFloat(cashReceived) || 0,
        phonePay: parseFloat(phonePay) || 0,
        creditCard: parseFloat(creditCard) || 0,
      },
      inventoryData: {
        productId: products[0]?.productId || "",
        quantity: parseFloat(products[0]?.salesLiters) || 0,
        metric: products[0]?.metric || "Liters (Sale)",
        employeeId: parseInt(employeeId),
      },
    };

    console.log("Submitting payload to /entryData:", payload);

    try {
      await axios.post("http://localhost:8080/entryData", payload);
      showToast("Sales & Collections submitted successfully", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          "Submission failed. Please check your data and try again.",
        "error"
      );
      console.error("Backend error:", err?.response?.data);
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
                  <span role="img" aria-label="sales">💰</span> Sales
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
                        readOnly
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

                  <h4 className="text-secondary mt-4 mb-3">Sales</h4>
                  {products.map((p, i) => (
                    <div className="row border rounded p-3 mb-4" key={i}>
                      {[
                        { label: "Product Name", field: "productName", type: "select" },
                        { label: "Gun", field: "gun", type: "select" },
                        { label: "Opening", field: "opening", readOnly: true },
                        { label: "Closing", field: "closing" },
                        { label: "Price", field: "price", readOnly: true },
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
                              step="0.01"
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
                          step="0.01"
                          className={`form-control form-control-lg ${
                            label === "Short Collections" &&
                            parseFloat(shortCollections) < -10
                              ? "is-invalid"
                              : ""
                          }`}
                          value={readOnly ? Number(value).toFixed(2) : value}
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