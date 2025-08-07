import { Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login/Login';
import Registration from "./pages/SignUp/Registration";
import DashboardHome from './pages/DashboardHome/DashboardHome';
import SalesCollections from "./pages/SalesAndCollections/SalesCollections";
import ViewInventory from "./pages/InventoryManagement/ViewInventory";
import UpdateInventory from "./pages/InventoryManagement/UpdateInventory";
import UpdatePrice from "./pages/ProductManagement/UpdatePrice";
import ViewProducts from "./pages/ProductManagement/ViewProducts";
import AddProduct from "./pages/ProductManagement/AddProduct";
import ViewExpenses from "./pages/ExpensesManagement/ViewExpenses";
import AddNewExpense from "./pages/ExpensesManagement/AddNewExpense";
import AddCategory from "./pages/ExpensesManagement/AddCategory";
import ViewDocuments from "./pages/DocumentsManagment/ViewDocuments";
import UploadDocument from "./pages/DocumentsManagment/UploadDocument";
import ViewCustomers from "./pages/CustomersManagement/ViewCustomers";
import AddNewCustomer from "./pages/CustomersManagement/AddNewCustomer";
import DashboardLayout from "./pages/DashboardLayout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Registration />} />

      {/* Protected Routes with Layout */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* All dashboard child routes share the same layout + navbar */}
        <Route path="home" element={<DashboardHome />} />
        <Route path="salescollections" element={<SalesCollections />} />
        <Route path="inventory/view" element={<ViewInventory />} />
        <Route path="inventory/update" element={<UpdateInventory />} />
        <Route path="products/price" element={<UpdatePrice />} />
        <Route path="products/view" element={<ViewProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="expenses/view" element={<ViewExpenses />} />
        <Route path="expenses/add" element={<AddNewExpense />} />
        <Route path="expenses/add-category" element={<AddCategory />} />
        <Route path="documents/view" element={<ViewDocuments />} />
        <Route path="documents/upload" element={<UploadDocument />} />
        <Route path="customers/view" element={<ViewCustomers />} />
        <Route path="customers/add" element={<AddNewCustomer />} />
      </Route>

      {/* Catch-all route redirects to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
