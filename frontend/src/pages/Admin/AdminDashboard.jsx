import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSideBar from "../../components/AdminSideBar";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "Admin") {
      console.log("Unauthorized access! Redirecting to home.");
      navigate("/"); // ✅ Redirect non-admins to Home
    }
  }, [navigate]);

  return (
    <div className="flex">
      <AdminSideBar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Welcome to Admin Dashboard</h1>
      </div>
    </div>
  );
};

export default AdminDashboard;
