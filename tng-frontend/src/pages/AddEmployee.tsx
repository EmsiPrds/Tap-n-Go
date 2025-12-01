import { ArrowLeft, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Toast } from "../components/ui/Toast";
import { useNavigate } from "../hooks/useNavigate";
import { useToast } from "../hooks/useToast";
import api from "../services/api";

export function AddEmployee() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    position: "",
    shift_start: "09:00",
    shift_end: "18:00",
    avatar_url: "",
    status: "active" as "active" | "inactive",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = "Employee ID is required";
    } else if (formData.employee_id.length < 3 || formData.employee_id.length > 20) {
      newErrors.employee_id = "Employee ID must be between 3 and 20 characters";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (formData.first_name.length < 2 || formData.first_name.length > 50) {
      newErrors.first_name = "First name must be between 2 and 50 characters";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (formData.last_name.length < 2 || formData.last_name.length > 50) {
      newErrors.last_name = "Last name must be between 2 and 50 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email address";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    } else if (formData.department.length < 2 || formData.department.length > 50) {
      newErrors.department = "Department must be between 2 and 50 characters";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    } else if (formData.position.length < 2 || formData.position.length > 50) {
      newErrors.position = "Position must be between 2 and 50 characters";
    }

    if (!formData.shift_start.trim()) {
      newErrors.shift_start = "Shift start time is required";
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.shift_start)) {
      newErrors.shift_start = "Please provide a valid time format (HH:MM)";
    }

    if (!formData.shift_end.trim()) {
      newErrors.shift_end = "Shift end time is required";
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.shift_end)) {
      newErrors.shift_end = "Please provide a valid time format (HH:MM)";
    }

    if (formData.avatar_url && !/^https?:\/\/.+/.test(formData.avatar_url)) {
      newErrors.avatar_url = "Please provide a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        employee_id: formData.employee_id.toUpperCase(),
        avatar_url: formData.avatar_url || undefined,
      };

      const response = await api.post("/employees", payload);

      if (response.data.success) {
        showToast("Employee added successfully!", "success");
        navigate("/dashboard");
      } else {
        showToast(
          response.data.message || "Failed to add employee",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Add employee error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "An error occurred while adding the employee. Please try again.";
      showToast(errorMessage, "error");

      // Set field-specific errors if provided
      if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Check if form has any data
    const hasData = Object.values(formData).some(
      (value) => value && value !== "" && value !== "09:00" && value !== "18:00" && value !== "active"
    );

    if (hasData) {
      setShowCancelModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={handleCancel}
              >
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">
                Add New Employee
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee ID */}
              <div>
                <label
                  htmlFor="employee_id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="employee_id"
                  name="employee_id"
                  type="text"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.employee_id
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="EMP001"
                  maxLength={20}
                />
                {errors.employee_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.employee_id}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* First Name */}
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.first_name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="John"
                  maxLength={50}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.first_name}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.last_name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Doe"
                  maxLength={50}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.last_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="john.doe@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.department
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Engineering"
                  maxLength={50}
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Position */}
              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.position
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Senior Developer"
                  maxLength={50}
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                )}
              </div>

              {/* Shift Start */}
              <div>
                <label
                  htmlFor="shift_start"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Shift Start <span className="text-red-500">*</span>
                </label>
                <input
                  id="shift_start"
                  name="shift_start"
                  type="time"
                  value={formData.shift_start}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.shift_start
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.shift_start && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.shift_start}
                  </p>
                )}
              </div>

              {/* Shift End */}
              <div>
                <label
                  htmlFor="shift_end"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Shift End <span className="text-red-500">*</span>
                </label>
                <input
                  id="shift_end"
                  name="shift_end"
                  type="time"
                  value={formData.shift_end}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.shift_end
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.shift_end && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.shift_end}
                  </p>
                )}
              </div>

              {/* Avatar URL */}
              <div className="md:col-span-2">
                <label
                  htmlFor="avatar_url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Avatar URL (Optional)
                </label>
                <input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.avatar_url
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="https://example.com/avatar.jpg"
                />
                {errors.avatar_url && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.avatar_url}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                icon={<UserPlus className="w-5 h-5" />}
              >
                Add Employee
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        size="sm"
        title="Discard Changes?"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You have unsaved changes. Are you sure you want to leave? All
            changes will be lost.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
            >
              Continue Editing
            </Button>
            <Button variant="primary" onClick={handleConfirmCancel}>
              Discard Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
