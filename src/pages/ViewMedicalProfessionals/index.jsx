import { useEffect, useState } from 'react';
import { Trash2, Edit2, AlertCircle, CheckCircle, Users, Phone, Mail, Building, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ViewMedicalProfessionals() {
    const [professionals, setProfessionals] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success'); // 'success', 'error', 'info'
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);
    const navigate = useNavigate();

    // Clear message after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        // Simulate checking for state messages (normally from router location state)
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');

        if (action === 'added') {
            setMessage('Medical professional added successfully.');
            setMessageType('success');
        } else if (action === 'updated') {
            setMessage('Medical professional updated successfully.');
            setMessageType('success');
        } else if (action === 'deleted') {
            setMessage('Medical professional deleted successfully.');
            setMessageType('success');
        }

        // Fetch professionals with error handling
        fetchProfessionals();
    }, []);

    const fetchProfessionals = async () => {
        try {
            setIsLoading(true);
            setError('');

            // Simulate API call with mock data
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await fetch(`/api/all-medical-professionals.php`);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response format. Expected JSON.');
            }

            const data = await response.json();


            if (Array.isArray(data)) {
                setProfessionals(data);
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                throw new Error('Invalid data format received from server.');
            }
        } catch (err) {
            console.error('Error fetching professionals:', err);
            setError(err.message || 'Failed to load medical professionals.');
            setMessage('Failed to load medical professionals. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        // Input validation
        if (!id) {
            setMessage("Invalid professional ID.");
            setMessageType("error");
            return;
        }

        // Validate ID is a positive number
        const numericId = parseInt(id, 10);
        if (isNaN(numericId) || numericId <= 0) {
            setMessage("Invalid professional ID format.");
            setMessageType("error");
            return;
        }

        // Validate name for confirmation dialog
        const displayName = name && name.trim() ? name.trim() : "this professional";

        if (
            !window.confirm(
                `Are you sure you want to delete ${displayName}? This action cannot be undone.`
            )
        ) {
            return;
        }

        // Check if already being deleted
        if (deleteLoading === id) {
            setMessage("Delete operation already in progress.");
            setMessageType("warning");
            return;
        }

        let timeoutId;

        try {
            setDeleteLoading(id);
            setMessage(""); // Clear any previous messages

            // Set a timeout for the request (30 seconds)
            const controller = new AbortController();
            timeoutId = setTimeout(() => {
                controller.abort();
            }, 30000);

            const response = await fetch(
                `/api/delete-medical-professional.php?id=${encodeURIComponent(
                    numericId
                )}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    credentials: "include",
                    signal: controller.signal,
                }
            );

            // Clear timeout if request completes
            clearTimeout(timeoutId);

            // Check if response is ok
            if (!response.ok) {
                let errorMessage = `Server error: ${response.status}`;

                // Try to get more specific error from response
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (parseError) {
                    // If JSON parsing fails, use the generic error message
                    console.warn("Failed to parse error response:", parseError);
                }

                throw new Error(errorMessage);
            }

            // Parse response
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse response JSON:", parseError);
                throw new Error("Invalid response format from server.");
            }

            // Validate response structure
            if (typeof data !== "object" || data === null) {
                throw new Error("Invalid response format from server.");
            }

            if (data.success === true) {
                // Remove from local state
                setProfessionals((prev) => {
                    const filtered = prev.filter((p) => p.id !== numericId);
                    console.log(
                        `Removed professional with ID ${numericId}. Remaining: ${filtered.length}`
                    );
                    return filtered;
                });

                // Success message
                const deletedName = data.deleted_name || displayName;
                setMessage(`${deletedName} has been deleted successfully.`);
                setMessageType("success");
            } else {
                // Handle server-side failure
                const errorMsg = data.message || "Failed to delete professional.";
                throw new Error(errorMsg);
            }
        } catch (err) {
            // Clear timeout if it exists
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            console.error("Error deleting professional:", err);

            // Handle different types of errors
            let userMessage;

            if (err.name === "AbortError") {
                userMessage =
                    "Request timed out. Please check your connection and try again.";
            } else if (err.message.includes("Failed to fetch")) {
                userMessage =
                    "Network error. Please check your connection and try again.";
            } else if (err.message.includes("Server error: 404")) {
                userMessage =
                    "Professional not found. It may have already been deleted.";
                // Remove from local state if it was a 404
                setProfessionals((prev) => prev.filter((p) => p.id !== numericId));
            } else if (err.message.includes("Server error: 500")) {
                userMessage = "Server error occurred. Please try again later.";
            } else {
                userMessage =
                    err.message || "Failed to delete professional. Please try again.";
            }

            setMessage(userMessage);
            setMessageType("error");
        } finally {
            // Always clear the loading state
            setDeleteLoading(null);

            // Clear timeout if it exists
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/edit-medical-professional?id=${id}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const MessageAlert = ({ message, type, onClose }) => {
        const getIcon = () => {
            switch (type) {
                case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
                case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
                default: return <AlertCircle className="w-5 h-5 text-blue-600" />;
            }
        };

        const getBgColor = () => {
            switch (type) {
                case 'success': return 'bg-green-50 border-green-200 text-green-800';
                case 'error': return 'bg-red-50 border-red-200 text-red-800';
                default: return 'bg-blue-50 border-blue-200 text-blue-800';
            }
        };

        return (
            <div className={`border rounded-lg p-4 mb-6 flex items-center justify-between shadow-sm ${getBgColor()}`}>
                <div className="flex items-center gap-3">
                    {getIcon()}
                    <span className="font-medium">{message}</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-current opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Close message"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="max-w-[800px] mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">Loading medical professionals ...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <Users size={20} strokeWidth={3} className="text-[#444]" />
                    <h1 className="text-[20px] font-[600] text-[#444] leading-[25px]">Medical Professionals</h1>
                </div>
                <p className="text-gray-600">Manage and view all medical professionals in the system</p>
            </div>

            {/* Messages */}
            {message && (
                <MessageAlert
                    message={message}
                    type={messageType}
                    onClose={() => setMessage('')}
                />
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchProfessionals}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!error && !isLoading && professionals.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medical Professionals Found</h3>
                    <p className="text-gray-600">There are currently no medical professionals in the system.</p>
                </div>
            )}

            {/* Data Table */}
            {!error && !isLoading && professionals.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Name</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Specialty</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Department</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Created</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Updated</th>
                                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {professionals.map((professional) => (
                                    <tr key={professional.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900">
                                                {professional.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 w-full text-center">
                                                {professional.specialty || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                {professional.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone size={16} className="" />
                                                        <span>{professional.phone}</span>
                                                    </div>
                                                )}
                                                {professional.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={16} className="" />
                                                        <span className="truncate max-w-48">{professional.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center flex-nowrap gap-2 text-gray-700">
                                                <Building size={16} className="" />
                                                <span className='whitespace-nowrap'>{professional.department || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Calendar size={16} className="" />
                                                <span className='whitespace-nowrap'>{formatDate(professional.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={16} className="" />
                                                <span className='whitespace-nowrap'>{formatDate(professional.updated_at)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(professional.id)}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    title="Edit professional"
                                                >
                                                    <Edit2 size={16} className="" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(professional.id, professional.name)}
                                                    disabled={deleteLoading === professional.id}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                    title="Delete professional"
                                                >
                                                    {deleteLoading === professional.id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    ) : (
                                                        <Trash2 size={16} className="" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Showing {professionals.length} medical professional{professionals.length !== 1 ? 's' : ''}</span>
                            <button
                                onClick={fetchProfessionals}
                                className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
                            >
                                Refresh Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}