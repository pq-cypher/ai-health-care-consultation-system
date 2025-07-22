import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, CheckCircle, XCircle, User, Phone, Mail, Building, Stethoscope } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SPECIALTIES = [
    'Cardiologist', 'Pulmonologist', 'Neurologist', 'Emergency Medicine',
    'General Practitioner', 'Endocrinologist', 'Dermatologist', 'Pediatrician',
    'Orthopedic Surgeon', 'Radiologist', 'Oncologist', 'Psychiatrist', 'Urologist',
    'Nephrologist', 'Hematologist', 'Obstetrician', 'Gynecologist', 'Gastroenterologist',
    'Rheumatologist', 'Ophthalmologist', 'Otolaryngologist', 'Infectious Disease Specialist',
    'Allergist', 'Pathologist', 'Anesthesiologist', 'Plastic Surgeon', 'Vascular Surgeon',
    'Thoracic Surgeon', 'Palliative Care Specialist', 'Rehabilitation Specialist',
    'Geriatrician', 'Sports Medicine Specialist', 'Clinical Geneticist',
    'Occupational Medicine Specialist'
];

const FIELD_ICONS = {
    name: User,
    specialty: Stethoscope,
    phone: Phone,
    email: Mail,
    department: Building
};

export default function EditMedicalProfessional() {
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: '', specialty: '', phone: '', email: '', department: ''
    });
    const [original, setOriginal] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ type: '', message: '' });
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Mock navigation functions - replace with your actual routing logic
    const navigateFunc = (path) => {
        navigate(path);
    };

    const id = searchParams.get('id');

    // Validation functions
    const validateEmail = (email) => {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Please enter a valid email address';
    };

    const validatePhone = (phone) => {
        if (!phone.trim()) return 'Phone number is required';
        if (!(/^\+?\d{7,14}$/).test(phone.trim().replace(/[\s\-\(\)]/g, ''))) {
            return 'Please enter a valid phone number';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.specialty) newErrors.specialty = 'Specialty is required';
        if (!form.department.trim()) newErrors.department = 'Department is required';

        const emailError = validateEmail(form.email);
        if (emailError) newErrors.email = emailError;

        const phoneError = validatePhone(form.phone);
        if (phoneError) newErrors.phone = phoneError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const showNotification = (type, message, duration = 5000) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: '', message: '' }), duration);
    };

    const handleNetworkError = (error, operation) => {
        console.error(`${operation} error:`, error);
        showNotification('error', `Network error during ${operation}. Please check your connection and try again.`);
    };

    useEffect(() => {
        if (!id) {
            showNotification('error', 'No medical professional ID provided');
            setTimeout(() => navigateFunc('/admin/view-medical-professionals'), 2000);
            return;
        }

        const fetchMedicalProfessional = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/get-medical-professional.php?id=${encodeURIComponent(id)}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const json = await response.json();

                if (!json || !json.id) {
                    showNotification('error', 'Medical professional not found');
                    setTimeout(() => navigateFunc('/admin/view-medical-professionals'), 2000);
                    return;
                }

                // Ensure all form fields have values
                const sanitizedData = {
                    name: json.name || '',
                    specialty: json.specialty || '',
                    phone: json.phone || '',
                    email: json.email || '',
                    department: json.department || ''
                };

                setForm(sanitizedData);
                setOriginal(sanitizedData);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                handleNetworkError(error, 'fetching data');
                setTimeout(() => navigateFunc('/admin/view-medical-professionals'), 3000);
            }
        };

        fetchMedicalProfessional();
    }, [id]);

    const canSave = () => {
        return !saving && !deleting && Object.keys(form).some(k => form[k] !== original[k]) && Object.keys(errors).every(k => errors[k].length === 0)
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        let error = '';
        switch (name) {
            case 'name':
                error = !value.trim() ? 'Name is required' : '';
                break;
            case 'specialty':
                error = !value ? 'Specialty is required' : '';
                break;
            case 'department':
                error = !value.trim() ? 'Department is required' : '';
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'phone':
                error = validatePhone(value);
                break;
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let error = '';

        switch (name) {
            case 'name':
                error = !value.trim() ? 'Name is required' : '';
                break;
            case 'specialty':
                error = !value ? 'Specialty is required' : '';
                break;
            case 'department':
                error = !value.trim() ? 'Department is required' : '';
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'phone':
                error = validatePhone(value);
                break;
        }

        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleSave = async () => {
        // Validate form before proceeding
        if (!validateForm()) {
            showNotification('error', 'Please fix the form errors before saving');
            return;
        }

        // Check if we have a valid ID
        if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
            showNotification('error', 'Invalid medical professional ID');
            return;
        }

        // Validate required form fields exist
        const requiredFields = ['name', 'specialty', 'phone', 'email', 'department'];
        const missingFields = requiredFields.filter(field => !form[field] || form[field].trim() === '');

        if (missingFields.length > 0) {
            showNotification('error', `Missing required fields: ${missingFields.join(', ')}`);
            return;
        }

        setSaving(true);

        try {
            // Create request payload
            const payload = {
                id: parseInt(id),
                name: form.name.trim(),
                specialty: form.specialty.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                department: form.department.trim()
            };

            // Validate email format on client side
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(payload.email)) {
                throw new Error('Invalid email format');
            }

            // Validate field lengths
            if (payload.name.length > 100) {
                throw new Error('Name is too long (maximum 100 characters)');
            }
            if (payload.specialty.length > 100) {
                throw new Error('Specialty is too long (maximum 100 characters)');
            }
            if (payload.phone.length > 20) {
                throw new Error('Phone number is too long (maximum 20 characters)');
            }
            if (payload.department.length > 100) {
                throw new Error('Department name is too long (maximum 100 characters)');
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(`/api/edit-medical-professional.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Check if response is ok
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Medical professional not found');
                } else if (response.status === 400) {
                    // Try to get error message from response
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch {
                        throw new Error('Invalid data provided');
                    }
                    throw new Error(errorData.message || 'Invalid data provided');
                } else if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            // Validate response content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response format from server');
            }

            let json;
            try {
                json = await response.json();
            } catch (parseError) {
                throw new Error('Failed to parse server response');
            }

            // Validate response structure
            if (typeof json !== 'object' || json === null) {
                throw new Error('Invalid response from server');
            }

            if (json.success === true) {
                showNotification('success', json.message || 'Medical professional updated successfully');
                setOriginal(form);
            } else {
                throw new Error(json.message || 'Update failed for unknown reason');
            }

        } catch (error) {
            // Handle different types of errors
            let errorMessage = 'An error occurred while saving';

            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            console.error('Save error:', error);
            showNotification('error', errorMessage);

            // Optional: You could implement retry logic here
            // if (error.name !== 'AbortError' && !error.message.includes('Invalid')) {
            //   // Offer retry for network/server errors
            // }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);

        try {
            const response = await fetch(`/api/delete-medical-professional.php?id=${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();

            if (json && json.success) {
                showNotification('success', 'Medical professional deleted successfully');
                setTimeout(() => {
                    navigateFunc('/admin/view-medical-professionals?action=deleted');
                }, 1500);
            } else {
                throw new Error(json?.message || 'Delete failed');
            }
        } catch (error) {
            setDeleting(false);
            setConfirmingDelete(false);
            handleNetworkError(error, 'deleting');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-gray-600">Loading medical professional...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Medical Professional</h1>
                    <p className="text-gray-600">Update the information for this medical professional</p>
                </div>

                {/* Notification */}
                {notification.message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${notification.type === 'error'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : notification.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                        {notification.type === 'error' && <XCircle size={20} />}
                        {notification.type === 'success' && <CheckCircle size={20} />}
                        {notification.type === 'warning' && <AlertTriangle size={20} />}
                        <span>{notification.message}</span>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="space-y-6">
                        {['name', 'specialty', 'phone', 'email', 'department'].map(field => {
                            const Icon = FIELD_ICONS[field];
                            return (
                                <div key={field} className="space-y-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <Icon size={16} className="text-gray-500" />
                                        <span className="capitalize">{field}</span>
                                        <span className="text-red-500">*</span>
                                    </label>

                                    {field === 'specialty' ? (
                                        <select
                                            name="specialty"
                                            value={form.specialty}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.specialty ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select Specialty</option>
                                            {SPECIALTIES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            name={field}
                                            type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                                            value={form[field]}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder={`Enter ${field}`}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                        />
                                    )}

                                    {errors[field] && (
                                        <p className="text-red-600 text-sm flex items-center space-x-1">
                                            <XCircle size={14} />
                                            <span>{errors[field]}</span>
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                        <button
                            onClick={() => setConfirmingDelete(true)}
                            disabled={deleting || saving}
                            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {deleting ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <XCircle size={16} />
                            )}
                            <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={!canSave()}
                            className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${canSave()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-md'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {saving ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <CheckCircle size={16} />
                            )}
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {confirmingDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="text-red-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                                    <p className="text-gray-600 text-sm">This action cannot be undone</p>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete <strong>{form.name}</strong>?
                                This will permanently remove all their information from the system.
                            </p>

                            <div className="flex space-x-3 justify-end">
                                <button
                                    onClick={() => setConfirmingDelete(false)}
                                    disabled={deleting}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {deleting ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <XCircle size={16} />
                                    )}
                                    <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}