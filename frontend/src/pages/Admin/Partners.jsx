import { useState, useEffect } from "react";
import AdminSideBar from "../../components/AdminSideBar";

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [newPartner, setNewPartner] = useState({
    fullName: "",
    restaurantName: "",
    address: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all partners from the backend
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the auth token from localStorage
        if (!token) {
          setError("Please login to access this page");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:3000/api/admin/partners", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Please login to access this page");
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch partners");
        }

        const data = await response.json();
        setPartners(data);
      } catch (err) {
        console.error("Error fetching partners:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Handle Partner Approval
  const handleApprove = async (partnerId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to access this page");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/admin/partners/approve/${partnerId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to approve partner");
      }

      const data = await response.json();
      setPartners((prev) =>
        prev.map((partner) => (partner._id === partnerId ? { ...partner, approved: true } : partner))
      );
      console.log("Partner Approved:", data);
    } catch (err) {
      console.error("Error approving partner:", err);
      setError(err.message);
    }
  };

  // Handle Partner Deletion
  const handleDelete = async (partnerId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to access this page");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/admin/partners/delete/${partnerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete partner");
      }

      setPartners((prev) => prev.filter((partner) => partner._id !== partnerId));
      console.log("Partner Deleted");
    } catch (err) {
      console.error("Error deleting partner:", err);
      setError(err.message);
    }
  };

  // Handle Input Change for Adding Partner
  const handleChange = (e) => {
    setNewPartner({ ...newPartner, [e.target.name]: e.target.value });
  };

  // Handle Admin Adding a New Partner
  const handleAddPartner = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to access this page");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3000/api/admin/partners/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPartner),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add partner");
      }

      const data = await response.json();
      setPartners((prev) => [...prev, data.newPartner]);
      setNewPartner({
        fullName: "",
        restaurantName: "",
        address: "",
        phone: "",
        email: "",
        password: "",
      });
      console.log("New Partner Added:", data.newPartner);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
        <AdminSideBar />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-center mb-6">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
        <AdminSideBar />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-center mb-6">Error</h1>
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
      <AdminSideBar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Manage Partners</h1>

        {/* Partner List */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0098c9ff] text-white">
                <th className="p-3">Full Name</th>
                <th className="p-3">Restaurant</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners && partners.length > 0 ? (
                partners.map((partner) => (
                  <tr key={partner._id} className="border-b">
                    <td className="p-3">{partner.fullName}</td>
                    <td className="p-3">{partner.restaurantName}</td>
                    <td className="p-3">{partner.email}</td>
                    <td className="p-3">{partner.phone || "N/A"}</td>
                    <td className="p-3">
                      {partner.approved ? (
                        <span className="text-green-600 font-semibold">Approved</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Pending</span>
                      )}
                    </td>
                    <td className="p-3 space-x-2">
                      {!partner.approved && (
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                          onClick={() => handleApprove(partner._id)}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                        onClick={() => handleDelete(partner._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-3 text-center">
                    No partners found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add New Partner Form */}
        <div className="mt-10 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">Add New Partner</h2>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <form onSubmit={handleAddPartner} className="space-y-4">
            <input type="text" name="fullName" placeholder="Full Name" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} required />
            <input type="text" name="restaurantName" placeholder="Restaurant Name" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} required />
            <input type="text" name="address" placeholder="Address (Optional)" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} />
            <input type="tel" name="phone" placeholder="Phone Number (Optional)" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} required />

            <button className="w-full bg-[#fea116ff] text-white py-2 rounded-md hover:bg-[#e69510ff] transition" disabled={loading}>
              {loading ? "Adding Partner..." : "Add Partner"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Partners;
