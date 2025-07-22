import { useState, useEffect } from 'react';
import { Loader2, Plus, AlertCircle, User, Phone, Mail, Building, Stethoscope, CheckCircle, PlusSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SPECIALTIES = [
  'Cardiologist','Pulmonologist','Neurologist','Emergency Medicine',
  'General Practitioner','Endocrinologist','Dermatologist','Pediatrician',
  'Orthopedic Surgeon','Radiologist','Oncologist','Psychiatrist','Urologist',
  'Nephrologist','Hematologist','Obstetrician','Gynecologist','Gastroenterologist',
  'Rheumatologist','Ophthalmologist','Otolaryngologist','Infectious Disease Specialist',
  'Allergist','Pathologist','Anesthesiologist','Plastic Surgeon','Vascular Surgeon',
  'Thoracic Surgeon','Palliative Care Specialist','Rehabilitation Specialist',
  'Geriatrician','Sports Medicine Specialist','Clinical Geneticist',
  'Occupational Medicine Specialist'
];

export default function AddMedicalProfessional() {
  const [form, setForm] = useState({
    name: '', specialty: '', phone: '', email: '', department: ''
  });
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState({});
  const [networkError, setNetworkError] = useState('');
  const [touched, setTouched] = useState({});
  let navigate = useNavigate();

  // Enhanced validation
  const validateField = (name, value) => {
    const trimmedValue = value.trim();
    
    switch (name) {
      case 'name':
        if (!trimmedValue) return 'Name is required';
        if (trimmedValue.length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(trimmedValue)) return 'Name contains invalid characters';
        break;
      
      case 'email':
        if (!trimmedValue) return 'Email is required';
        if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(trimmedValue)) return 'Please enter a valid email address';
        break;
      
      case 'phone':
        if (!trimmedValue) return 'Phone number is required';
        if (!(/^\+?\d{7,14}$/).test(trimmedValue.replace(/[\s\-\(\)]/g, ''))) {
            return 'Please enter a valid phone number';
        }
        break;
      
      case 'department':
        if (!trimmedValue) return 'Department is required';
        if (trimmedValue.length < 2) return 'Department must be at least 2 characters';
        break;
      
      case 'specialty':
        if (!trimmedValue) return 'Specialty is required';
        if (!SPECIALTIES.includes(trimmedValue)) return 'Please select a valid specialty';
        break;
      
      default:
        return '';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canAdd = () => {
    return Object.values(form).every(v => v.trim().length > 0) && 
           Object.values(errors).every(v => v.trim().length === 0)
  };

  let testNum = 1;
  useEffect(()=>{
    console.log(Object.keys(errors))
    console.log(canAdd());
    console.log("testNum:",testNum++);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
    
    // Clear network error when user makes changes
    if (networkError) setNetworkError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  
    const handleAdd = async () => {
        console.log("submit");

        // Mark all fields as touched
        const allTouched = {};
        Object.keys(form).forEach(key => allTouched[key] = true);
        setTouched(allTouched);

        console.log(validateForm());
        if (!validateForm()) {
            setNetworkError('Please fix the errors below.');
            return;
        }

        // Check for empty values after trim
        const trimmedForm = {};
        let hasEmptyFields = false;
        Object.keys(form).forEach(key => {
            const trimmedValue = form[key]?.toString().trim() || '';
            trimmedForm[key] = trimmedValue;
            if (!trimmedValue) {
                hasEmptyFields = true;
            }
        });

        if (hasEmptyFields) {
            setNetworkError('All fields are required.');
            return;
        }

        setAdding(true);
        setNetworkError('');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            // Validate API endpoint
            const apiUrl = '/api/add-medical-professional.php';
            if (!apiUrl) {
                throw new Error('API endpoint not configured');
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    // Add cache control
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(trimmedForm),
                signal: controller.signal,
                // Add credentials and mode for better CORS handling
                credentials: 'include',
                mode: 'cors'
            });

            clearTimeout(timeoutId);

            // Enhanced response validation
            if (!response) {
                throw new Error('No response received from server');
            }

            // Check for various HTTP error statuses
            if (response.status === 400) {
                const errorText = await response.text();
                let errorMessage = 'Invalid data provided';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    // Use default message if JSON parsing fails
                }
                throw new Error(errorMessage);
            }

            if (response.status === 409) {
                throw new Error('Email address already exists. Please use a different email.');
            }

            if (response.status === 500) {
                throw new Error('Server error occurred. Please try again later.');
            }

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            // Validate content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Invalid content type:', contentType);
                throw new Error('Invalid response format from server');
            }

            let json;
            try {
                const responseText = await response.text();
                if (!responseText) {
                    throw new Error('Empty response from server');
                }
                json = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid response format from server');
            }

            // Validate response structure
            if (typeof json !== 'object' || json === null) {
                throw new Error('Invalid response structure from server');
            }

            if (json.success === true) {
                // Additional validation for successful response
                if (!json.id || typeof json.id !== 'number') {
                    console.warn('Success response missing valid ID:', json.id);
                }

                // Navigate with success message
                navigate('/admin/view-medical-professionals?action=added');
            } else {
                // Handle server-side validation errors
                const errorMessage = json.message || 'Failed to add medical professional';
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('Add medical professional error:', error);

            // Enhanced error handling with specific error types
            if (error.name === 'AbortError') {
                setNetworkError('Request timed out. Please check your connection and try again.');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setNetworkError('Network error. Please check your internet connection and try again.');
            } else if (error.message.includes('Failed to fetch')) {
                setNetworkError('Unable to connect to server. Please check your connection and try again.');
            } else if (error.message.includes('NetworkError')) {
                setNetworkError('Network error occurred. Please try again.');
            } else if (error.message.includes('CORS')) {
                setNetworkError('Server configuration error. Please contact support.');
            } else if (error.message.includes('already exists')) {
                setNetworkError(error.message);
            } else if (error.message.includes('Invalid data') || error.message.includes('required')) {
                setNetworkError(error.message);
            } else {
                // Log unexpected errors for debugging
                console.error('Unexpected error:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                setNetworkError(error.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setAdding(false);
        }
    };

  const getFieldIcon = (field) => {
    switch (field) {
      case 'name': return <User size={14} className="text-gray-400" />;
      case 'phone': return <Phone size={14} className="text-gray-400" />;
      case 'email': return <Mail size={14} className="text-gray-400" />;
      case 'department': return <Building size={14} className="text-gray-400" />;
      default: return null;
    }
  };

  if (adding) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-600 font-medium">
            {'Adding medical professional...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center mb-1 gap-2">
            <PlusSquare size={20} className="text-[#444]" />
            <h1 className="text-[20px] font-[600] text-[#444] leading-[25px]">Add Medical Professional</h1>
          </div>
          <p className="text-gray-600">Enter the details of the new medical professional</p>
        </div>

        {/* Error Alert */}
        {networkError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800">Error</h4>
              <p className="text-red-700 text-sm mt-1">{networkError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form className="space-y-6"
               onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
            {/* Regular Input Fields */}
            {['name', 'phone', 'email', 'department'].map((field) => (
              <div key={field} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getFieldIcon(field)}
                  </div>
                  <input
                    name={field}
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    placeholder={`Enter ${field}`}
                    value={form[field]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors[field] && touched[field]
                        ? 'border-red-300 focus:ring-red-500 bg-red-50'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-300 bg-white hover:border-gray-300'
                    }`}
                  />
                </div>
                {errors[field] && touched[field] && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors[field]}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Specialty Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Medical Specialty *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Stethoscope className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 appearance-none bg-white ${
                    errors.specialty && touched.specialty
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-300 hover:border-gray-300'
                  }`}
                >
                  <option value="">Select a medical specialty</option>
                  {SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
              {errors.specialty && touched.specialty && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.specialty}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!canAdd() || adding}
                className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                  canAdd() && !adding
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {adding ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Medical Professional</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success Indicator */}
        {canAdd() && !adding && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Form is ready to submit</span>
          </div>
        )}
      </div>
    </div>
  );
}