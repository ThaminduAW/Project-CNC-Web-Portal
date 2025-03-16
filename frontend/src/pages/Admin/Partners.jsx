import { useState, useEffect } from "react";
import AdminSideBar from "../../components/AdminSideBar"; // Ensure correct path

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPartner, setEditingPartner] = useState(null);
  const [updatedData, setUpdatedData] = useState({ fullName: "", restaurantName: "", address: "", phone: "" });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/partners", { method: "GET", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
      if (!response.ok) throw new Error("Failed to fetch partners");

      const data = await response.json();
      setPartners(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/admin/partners/approve/${id}`, { method: "PATCH", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
      fetchPartners();
    } catch (err) {
      console.error("Error approving partner:", err);
    }
  };

  const handleDecline = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/admin/partners/decline/${id}`, { method: "DELETE" });
      fetchPartners();
    } catch (err) {
      console.error("Error declining partner:", err);
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner._id);
    setUpdatedData({
      fullName: partner.fullName,
      restaurantName: partner.restaurantName,
      address: partner.address || "",
      phone: partner.phone || "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/admin/partners/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      setEditingPartner(null);
      fetchPartners();
    } catch (err) {
      console.error("Error updating partner:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      try {
        await fetch(`http://localhost:3000/api/admin/partners/delete/${id}`, { method: "DELETE" });
        fetchPartners();
      } catch (err) {
        console.error("Error deleting partner:", err);
      }
    }
  };

  return (
    <div className="flex">
      {/* Admin Sidebar */}
      <AdminSideBar />

      {/* Main Content */}
      <div className="p-6 flex-1">
        <h1 className="text-3xl font-bold">Manage Partners</h1>

        {loading && <p className="text-gray-600 mt-4">Loading...</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {!loading && !error && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold">Pending Approvals</h2>
            <ul>
              {partners.filter((p) => !p.approved).map((partner) => (
                <li key={partner._id} className="flex justify-between p-4 bg-gray-100 rounded-md mt-2">
                  <div>
                    <p><strong>{partner.restaurantName}</strong></p>
                    <p>👤 {partner.fullName} | 📧 {partner.email}</p>
                  </div>
                  <div>
                    <button onClick={() => handleApprove(partner._id)} className="bg-green-500 text-white px-3 py-1 rounded mr-2">
                      Approve
                    </button>
                    <button onClick={() => handleDecline(partner._id)} className="bg-red-500 text-white px-3 py-1 rounded">
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Table for Approved Partners */}
            <h2 className="text-2xl font-semibold mt-8">Approved Partners</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-[#0098c9ff] text-white">
                  <tr>
                    <th className="py-2 px-4">Full Name</th>
                    <th className="py-2 px-4">Restaurant</th>
                    <th className="py-2 px-4">Address</th>
                    <th className="py-2 px-4">Phone</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.filter((p) => p.approved).map((partner) => (
                    <tr key={partner._id} className="border-t text-center">
                      {editingPartner === partner._id ? (
                        <>
                          <td className="py-2 px-4">
                            <input type="text" value={updatedData.fullName} onChange={(e) => setUpdatedData({ ...updatedData, fullName: e.target.value })} className="w-full px-2 py-1 border rounded-md" />
                          </td>
                          <td className="py-2 px-4">
                            <input type="text" value={updatedData.restaurantName} onChange={(e) => setUpdatedData({ ...updatedData, restaurantName: e.target.value })} className="w-full px-2 py-1 border rounded-md" />
                          </td>
                          <td className="py-2 px-4">
                            <input type="text" value={updatedData.address} onChange={(e) => setUpdatedData({ ...updatedData, address: e.target.value })} className="w-full px-2 py-1 border rounded-md" />
                          </td>
                          <td className="py-2 px-4">
                            <input type="text" value={updatedData.phone} onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })} className="w-full px-2 py-1 border rounded-md" />
                          </td>
                          <td className="py-2 px-4">
                            <button onClick={() => handleUpdate(partner._id)} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Save</button>
                            <button onClick={() => setEditingPartner(null)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-4">{partner.fullName}</td>
                          <td className="py-2 px-4">{partner.restaurantName}</td>
                          <td className="py-2 px-4">{partner.address}</td>
                          <td className="py-2 px-4">{partner.phone}</td>
                          <td className="py-2 px-4">
                            <button onClick={() => handleEdit(partner)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                            <button onClick={() => handleDelete(partner._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Partners;
