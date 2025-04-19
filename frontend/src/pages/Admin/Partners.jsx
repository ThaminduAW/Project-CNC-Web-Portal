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
    url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [success, setSuccess] = useState("");

  // Fetch all partners from the backend
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const token = localStorage.getItem("token");
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

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          throw new Error("Unable to connect to the server. Please make sure the server is running.");
        }

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please login to access this page");
          }
          throw new Error(data.message || "Failed to fetch partners");
        }

        setPartners(data);
      } catch (err) {
        setError(err.message || "An error occurred while fetching partners");
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approved: true })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Unable to connect to the server. Please make sure the server is running.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve partner");
      }

      // Update the partners list with the approved partner
      setPartners((prev) =>
        prev.map((partner) =>
          partner._id === partnerId
            ? { ...partner, approved: true }
            : partner
        )
      );

      setSuccess("Partner approved successfully!");
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      setError(err.message || "An error occurred while approving the partner");
      setTimeout(() => setError(""), 3000);
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

      // Validate all required fields
      if (!newPartner.fullName || !newPartner.restaurantName || !newPartner.address || 
          !newPartner.phone || !newPartner.email || !newPartner.password || !newPartner.url) {
        setError("All fields are required");
        setLoading(false);
        return;
      }

      // Validate URL format
      try {
        new URL(newPartner.url);
      } catch (err) {
        setError("Please enter a valid URL (e.g., https://www.example.com)");
        setLoading(false);
        return;
      }

      // Validate password
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPartner.password)) {
        setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
        setLoading(false);
        return;
      }

      // Prepare the partner data
      const partnerData = {
        fullName: newPartner.fullName.trim(),
        restaurantName: newPartner.restaurantName.trim(),
        address: newPartner.address.trim(),
        phone: newPartner.phone.trim(),
        email: newPartner.email.trim(),
        password: newPartner.password,
        url: newPartner.url.trim(),
        role: "Partner",
        approved: true
      };

      const response = await fetch("http://localhost:3000/api/admin/partners/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(partnerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add partner");
      }

      setPartners((prev) => [...prev, data.newPartner]);
      setNewPartner({
        fullName: "",
        restaurantName: "",
        address: "",
        phone: "",
        email: "",
        password: "",
        url: "",
      });
      setShowModal(false);
      setSuccess("Partner added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error adding partner:", err);
      setError(err.message || "An error occurred while adding the partner");
    } finally {
      setLoading(false);
    }
  };

  // Handle View Details
  const handleViewDetails = (partner) => {
    setSelectedPartner(partner);
    setShowDetailsModal(true);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Partners</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#fea116ff] text-white px-4 py-2 rounded-md hover:bg-[#e69510ff] transition"
          >
            Add New Partner
          </button>
        </div>

        {/* Success and Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Partner List */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0098c9ff] text-white">
                <th className="p-3">Restaurant</th>
                <th className="p-3">Contact Person</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Address</th>
                <th className="p-3">Restaurant URL</th>
                <th className="p-3">Registration Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners && partners.length > 0 ? (
                partners.map((partner) => (
                  <tr key={partner._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">{partner.restaurantName}</td>
                    <td className="p-3">{partner.fullName}</td>
                    <td className="p-3">{partner.email}</td>
                    <td className="p-3">{partner.phone || "N/A"}</td>
                    <td className="p-3">{partner.address || "N/A"}</td>
                    <td className="p-3">
                      <a 
                        href={partner.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#0098c9ff] hover:text-[#0087b8ff] break-all"
                      >
                        {partner.url}
                      </a>
                    </td>
                    <td className="p-3">
                      {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-3">
                      {partner.approved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                        onClick={() => handleViewDetails(partner)}
                      >
                        View Details
                      </button>
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
                  <td colSpan="6" className="p-3 text-center text-gray-500">
                    No partners found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View Details Modal */}
        {showDetailsModal && selectedPartner && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#001524ff]">Partner Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Restaurant Name</h3>
                    <p className="text-lg text-[#001524ff]">{selectedPartner.restaurantName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Contact Person</h3>
                    <p className="text-lg text-[#001524ff]">{selectedPartner.fullName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Email</h3>
                    <p className="text-lg text-[#001524ff]">{selectedPartner.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Phone</h3>
                    <p className="text-lg text-[#001524ff]">{selectedPartner.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Address</h3>
                    <p className="text-lg text-[#001524ff]">{selectedPartner.address}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Restaurant URL</h3>
                    <a 
                      href={selectedPartner.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg text-[#0098c9ff] hover:text-[#0087b8ff] break-all"
                    >
                      {selectedPartner.url}
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Registration Date</h3>
                    <p className="text-lg text-[#001524ff]">
                      {new Date(selectedPartner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Status</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedPartner.approved 
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {selectedPartner.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-end space-x-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Partner Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#001524ff]">Add New Partner</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleAddPartner} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="restaurantName"
                    placeholder="Enter restaurant name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant URL <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    name="url"
                    placeholder="https://www.example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Partner...
                      </span>
                    ) : (
                      "Add Partner"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partners;
