import { useState, useEffect } from "react";
import AdminSideBar from "../../components/AdminSideBar";
import { baseURL } from "../../utils/baseURL";
import { toast } from 'react-toastify';

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

  // Fetch all partners from the backend
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to access this page");
          setLoading(false);
          return;
        }

        const response = await fetch(`${baseURL}/admin/partners`, {
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
        toast.error(err.message || "An error occurred while fetching partners");
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
        toast.error("Please login to access this page");
        return;
      }

      const response = await fetch(`${baseURL}/admin/partners/approve/${partnerId}`, {
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

      toast.success("Partner approved successfully!");

    } catch (err) {
      toast.error(err.message || "An error occurred while approving the partner");
    }
  };

  // Handle Partner Deletion
  const handleDelete = async (partnerId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to access this page");
        return;
      }

      const response = await fetch(`${baseURL}/admin/partners/delete/${partnerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete partner");
      }

      setPartners((prev) => prev.filter((partner) => partner._id !== partnerId));
      toast.success("Partner deleted successfully!");
    } catch (err) {
      console.error("Error deleting partner:", err);
      toast.error(err.message || "Failed to delete partner");
    }
  };

  // Handle Input Change for Adding Partner
  const handleChange = (e) => {
    setNewPartner({ ...newPartner, [e.target.name]: e.target.value });
  };

  // Handle Admin Adding a New Partner
  const handleAddPartner = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to access this page");
        setLoading(false);
        return;
      }

      // Validate all required fields
      if (!newPartner.fullName || !newPartner.restaurantName || !newPartner.address || 
          !newPartner.phone || !newPartner.email || !newPartner.password || !newPartner.url) {
        toast.error("All fields are required");
        setLoading(false);
        return;
      }

      // Validate URL format
      try {
        new URL(newPartner.url);
      } catch (err) {
        toast.error("Please enter a valid URL (e.g., https://www.example.com)");
        setLoading(false);
        return;
      }

      // Validate password
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPartner.password)) {
        toast.error("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
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

      const response = await fetch(`${baseURL}/admin/partners/add`, {
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
      toast.success("Partner added successfully!");
    } catch (err) {
      console.error("Error adding partner:", err);
      toast.error(err.message || "An error occurred while adding the partner");
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
      <div className="flex flex-col lg:flex-row bg-[#fdfcdcff] text-[#001524ff] min-h-screen">
        <AdminSideBar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Loading...</h1>
        </div>
      </div>
    );
  }



  return (
    <div className="flex flex-col lg:flex-row bg-[#fdfcdcff] text-[#001524ff] min-h-screen">
      <AdminSideBar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Partners</h1>
          <button
            onClick={() => {
              setShowModal(true);
              // Reset form when opening modal
              setNewPartner({
                fullName: "",
                restaurantName: "",
                address: "",
                phone: "",
                email: "",
                password: "",
                url: "",
              });
            }}
            className="bg-[#fea116ff] text-white px-4 py-2 rounded-md hover:bg-[#e69510ff] transition w-full sm:w-auto text-center"
          >
            Add New Partner
          </button>
        </div>



        {/* Partner List */}
        <div className="bg-white shadow-md rounded-lg">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto p-6">
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
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-[#0098c9ff] rounded-lg hover:bg-[#0088b9ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0098c9ff] transition-colors duration-200"
                            onClick={() => handleViewDetails(partner)}
                            title="View partner details"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          {!partner.approved && (
                            <button
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                              onClick={() => handleApprove(partner._id)}
                              title="Approve partner"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                          )}
                          <button
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${partner.restaurantName}? This action cannot be undone.`)) {
                                handleDelete(partner._id);
                              }
                            }}
                            title="Delete partner"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-3 text-center text-gray-500">
                      No partners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {partners && partners.length > 0 ? (
              <div className="space-y-4 p-4">
                {partners.map((partner) => (
                  <div key={partner._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-[#001524ff]">{partner.restaurantName}</h3>
                          <p className="text-gray-600">{partner.fullName}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {partner.approved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Email:</span>
                          <p className="text-gray-800 break-all">{partner.email}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Phone:</span>
                          <p className="text-gray-800">{partner.phone || "N/A"}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="font-medium text-gray-500">Address:</span>
                          <p className="text-gray-800">{partner.address || "N/A"}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="font-medium text-gray-500">Website:</span>
                          <a 
                            href={partner.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#0098c9ff] hover:text-[#0087b8ff] break-all"
                          >
                            {partner.url}
                          </a>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Registered:</span>
                          <p className="text-gray-800">
                            {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>

                                            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                        <button
                          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-[#0098c9ff] rounded-lg hover:bg-[#0088b9ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0098c9ff] transition-colors duration-200 flex-1"
                          onClick={() => handleViewDetails(partner)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                        {!partner.approved && (
                          <button
                            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 flex-1"
                            onClick={() => handleApprove(partner._id)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                        )}
                        <button
                          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 flex-1"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${partner.restaurantName}? This action cannot be undone.`)) {
                              handleDelete(partner._id);
                            }
                          }}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No partners found
              </div>
            )}
          </div>
        </div>

        {/* View Details Modal */}
        {showDetailsModal && selectedPartner && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailsModal(false)}></div>
            <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#001524ff]">Partner Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Restaurant Name</h3>
                    <p className="text-base sm:text-lg text-[#001524ff] break-words">{selectedPartner.restaurantName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Contact Person</h3>
                    <p className="text-base sm:text-lg text-[#001524ff] break-words">{selectedPartner.fullName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Email</h3>
                    <p className="text-base sm:text-lg text-[#001524ff] break-all">{selectedPartner.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Phone</h3>
                    <p className="text-base sm:text-lg text-[#001524ff]">{selectedPartner.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Address</h3>
                    <p className="text-base sm:text-lg text-[#001524ff] break-words">{selectedPartner.address}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Restaurant URL</h3>
                    <a 
                      href={selectedPartner.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-base sm:text-lg text-[#0098c9ff] hover:text-[#0087b8ff] break-all block"
                    >
                      {selectedPartner.url}
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Registration Date</h3>
                    <p className="text-base sm:text-lg text-[#001524ff]">
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

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Partner Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)}></div>
            <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#001524ff]">Add New Partner</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddPartner} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    value={newPartner.fullName}
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
                    value={newPartner.restaurantName}
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
                    value={newPartner.address}
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
                    value={newPartner.phone}
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
                    value={newPartner.email}
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
                    value={newPartner.url}
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
                    value={newPartner.password}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-6 py-2 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
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
