import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardHome.css";

const cards = [
  {
    title: 'View Sales Data',
    description: 'Access detailed reports on daily, weekly, and monthly sales performance.',
    buttonText: 'Go to Sales',
    icon: 'bi-graph-up',
    path: '/dashboard/salescollections',
  },
  {
    title: 'Manage Inventory',
    description: 'Keep track of fuel stock levels and manage your supplies efficiently.',
    buttonText: 'Manage Stock',
    icon: 'bi-box-seam',
    path: '/dashboard/inventory/view',
  },
   {
    title: 'Manage Products',
    description: 'Keep track of products stock management and manage your products efficiently.',
    buttonText: 'Manage Products',
    icon: 'bi-archive',
    path: '/dashboard/products/view',
  },
  {
    title: 'Staff Management',
    description: 'Oversee employee schedules, roles, and performance metrics.',
    buttonText: 'View Staff',
    icon: 'bi-people',
    path: '/dashboard/employee',
  },
  {
    title: 'Customers',
    description: 'Manage customer accounts, loyalty programs, and feedback.',
    buttonText: 'View Customers',
    icon: 'bi-person-heart',
    path: '/dashboard/customers/view',
  },
  {
    title: 'Finance Management',
    description: 'Track expenses, income, and ensure financial control.',
    buttonText: 'View Finance',
    icon: 'bi-bar-chart-line',
    path: '/dashboard/customers',
  },
  {
    title: 'Settings & Profile',
    description: 'Update your account details and customize application settings.',
    buttonText: 'Edit Settings',
    icon: 'bi-gear',
    path: '/dashboard/settings',
  },
  {
    title: 'Expenses',
    description: 'Track and manage all operational expenses and financial outflows.',
    buttonText: 'Manage Expenses',
    icon: 'bi-cash-coin',
    path: '/dashboard/expenses/view',
  },
  {
    title: 'Documents',
    description: 'Access and manage important business documents and records.',
    buttonText: 'View Documents',
    icon: 'bi-file-earmark-text',
    path: '/dashboard/documents/view',
  },
  {
    title: 'Contact Us',
    description: 'Get support or send us your inquiries and feedback.',
    buttonText: 'Get Support',
    icon: 'bi-chat-dots',
    path: '/dashboard/contact',
  },
];

const DashboardHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Welcome back, {username}!</h1>
        <p className="text-muted fs-5">
          This is your personalized dashboard to manage your petrol bunk operations.
        </p>
      </div>

      <div className="row g-4">
        {cards.map((card, index) => (
          <div key={index} className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div
              className="card dashboard-card h-100 shadow-sm border-0"
              onClick={() => navigate(card.path)}
            >
              <div className="card-body d-flex flex-column">
                <div className="mb-3 text-primary">
                  <i className={`bi ${card.icon} fs-2`}></i>
                </div>
                <h5 className="card-title fw-semibold">{card.title}</h5>
                <p className="card-text text-muted flex-grow-1">{card.description}</p>
                <button className="btn btn-outline-primary mt-auto">
                  {card.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
