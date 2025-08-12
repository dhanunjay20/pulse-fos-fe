import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import axios from "axios";

const getLastNDates = (n) => {
  const dates = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates.reverse();
};

const getToday = () => new Date().toISOString().slice(0, 10);

const SalesGraph = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [startDate, setStartDate] = useState(getLastNDates(7)[0]);
  const [endDate, setEndDate] = useState(getLastNDates(7).slice(-1)[0]);

  useEffect(() => {
    axios.get("http://localhost:8080/sales").then((res) => {
      const grouped = {};
      res.data.forEach((s) => {
        const date = s.dateTime?.slice(0, 10);
        if (!date) return;
        if (!grouped[date]) {
          grouped[date] = { date, salesInLiters: 0, salesInRupees: 0 };
        }
        grouped[date].salesInLiters += s.salesInLiters || 0;
        grouped[date].salesInRupees += s.salesInRupees || 0;
      });
      setSales(Object.values(grouped));
    });
  }, []);

  useEffect(() => {
    const filtered = sales.filter(
      (s) => s.date >= startDate && s.date <= endDate
    );
    setFilteredSales(filtered);
  }, [sales, startDate, endDate]);

  const handleRange = (days) => {
    if (days === 1) {
      const today = getToday();
      setStartDate(today);
      setEndDate(today);
    } else {
      const dates = getLastNDates(days);
      setStartDate(dates[0]);
      setEndDate(dates.slice(-1)[0]);
    }
  };

  // Calculate totals for selected range
  const totalLiters = filteredSales.reduce((sum, s) => sum + s.salesInLiters, 0);
  const totalRupees = filteredSales.reduce((sum, s) => sum + s.salesInRupees, 0);

  return (
    <div className="container py-4" style={{ maxWidth: "100vw", width: "98%" }}>
      <div
        className="mb-4 px-4 py-3 rounded"
        style={{
          background: "linear-gradient(90deg, #2563eb 0%, #1e40af 100%)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "1.25rem",
          letterSpacing: "0.5px",
        }}
      >
        Sales (Liters &amp; Rupees)
      </div>
      <form className="row g-3 align-items-center mb-3">
        <div className="col-auto">
          <label htmlFor="fromDate" className="col-form-label">From:</label>
        </div>
        <div className="col-auto">
          <input
            id="fromDate"
            type="date"
            className="form-control shadow-sm"
            style={{ height: "48px" }}
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <label htmlFor="toDate" className="col-form-label">To:</label>
        </div>
        <div className="col-auto">
          <input
            id="toDate"
            type="date"
            className="form-control shadow-sm"
            style={{ height: "48px" }}
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-outline-success me-2"
            style={{ height: "48px", minWidth: "90px" }}
            onClick={() => handleRange(1)}
          >
            <i className="bi bi-calendar-day me-1"></i>Today
          </button>
          <button
            type="button"
            className="btn btn-outline-primary me-2"
            style={{ height: "48px", minWidth: "90px" }}
            onClick={() => handleRange(7)}
          >
            <i className="bi bi-calendar-week me-1"></i>Week
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            style={{ height: "48px", minWidth: "90px" }}
            onClick={() => handleRange(30)}
          >
            <i className="bi bi-calendar3 me-1"></i>Month
          </button>
        </div>
      </form>
      {/* Totals summary */}
      <div className="mb-3 d-flex gap-4" style={{ display: "flex" }}>
        <div className="p-3 bg-light rounded shadow-sm text-center" style={{ flex: 1 }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>Total Liters</div>
          <div style={{ fontSize: "1.5rem", color: "#2563eb", fontWeight: 700 }}>
            {totalLiters}
          </div>
        </div>
        <div className="p-3 bg-light rounded shadow-sm text-center" style={{ flex: 1 }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>Total Rupees</div>
          <div style={{ fontSize: "1.5rem", color: "#f59e42", fontWeight: 700 }}>
            ₹{totalRupees}
          </div>
        </div>
      </div>
      <div
        className="bg-white rounded shadow-sm p-3"
        style={{ maxWidth: "100vw", width: "98%", margin: "0 auto" }}
      >
        <ResponsiveContainer width="100%" height={350}>
          {filteredSales.length > 0 ? (
            <BarChart data={filteredSales}>
              <XAxis dataKey="date" />
              <YAxis
                yAxisId="left"
                label={{ value: "Liters", angle: -90, position: "insideLeft" }}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Rupees", angle: 90, position: "insideRight" }}
                allowDecimals={false}
              />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="salesInLiters" fill="#2563eb" name="Liters" />
              <Bar yAxisId="right" dataKey="salesInRupees" fill="#f59e42" name="Rupees" />
            </BarChart>
          ) : (
            <LineChart data={filteredSales}>
              <XAxis dataKey="date" />
              <YAxis
                yAxisId="left"
                label={{ value: "Liters", angle: -90, position: "insideLeft" }}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Rupees", angle: 90, position: "insideRight" }}
                allowDecimals={false}
              />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="salesInLiters" stroke="#2563eb" name="Liters" />
              <Line yAxisId="right" type="monotone" dataKey="salesInRupees" stroke="#f59e42" name="Rupees" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesGraph;