import { ArrowLeft, Grid, List, QrCode, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useNavigate } from "../hooks/useNavigate";
import api from "../services/api";
import type { Employee } from "../types";

export function EmployeeSelection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await api.get("/employees");
        if (response.data.success && Array.isArray(response.data.data)) {
          // Filter out any invalid employee objects and ensure they have required fields
          const validEmployees = response.data.data.filter(
            (emp: any) => emp && emp.id && emp.employee_id
          );
          setEmployees(validEmployees);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    if (!emp || emp.status !== "active") return false;

    const query = searchQuery.toLowerCase();
    const firstName = emp.first_name?.toLowerCase() || "";
    const lastName = emp.last_name?.toLowerCase() || "";
    const employeeId = emp.employee_id?.toLowerCase() || "";
    const department = emp.department?.toLowerCase() || "";

    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      employeeId.includes(query) ||
      department.includes(query)
    );
  });

  const handleSelectEmployee = (employee: Employee) => {
    navigate(`/tap/${employee.id}`);
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
                onClick={() => navigate("/dashboard")}
              >
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">
                Select Employee
              </h1>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={<QrCode className="w-4 h-4" />}
              onClick={() => navigate("/qr-scan")}
            >
              Scan QR/ID
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "secondary"}
                size="md"
                icon={<Grid className="w-5 h-5" />}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "secondary"}
                size="md"
                icon={<List className="w-5 h-5" />}
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employees...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Found {filteredEmployees.length}{" "}
                {filteredEmployees.length === 1 ? "employee" : "employees"}
              </p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left active:scale-95"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar
                        size="lg"
                        fallback={
                          employee.first_name && employee.last_name
                            ? `${employee.first_name[0]}${employee.last_name[0]}`
                            : employee.employee_id?.slice(0, 2).toUpperCase() ||
                              "EM"
                        }
                        src={employee.avatar_url}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {employee.first_name || ""} {employee.last_name || ""}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {employee.employee_id || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm font-medium text-gray-900">
                          {employee.department || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Position</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {employee.position || "N/A"}
                        </p>
                      </div>
                      <StatusBadge status={employee.status} size="sm" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {filteredEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center gap-4"
                  >
                    <Avatar
                      size="lg"
                      fallback={
                        employee.first_name && employee.last_name
                          ? `${employee.first_name[0]}${employee.last_name[0]}`
                          : employee.employee_id?.slice(0, 2).toUpperCase() ||
                            "EM"
                      }
                      src={employee.avatar_url}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {employee.first_name || ""} {employee.last_name || ""}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {employee.employee_id || "N/A"}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {employee.department || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {employee.position || "N/A"}
                      </p>
                    </div>
                    <StatusBadge status={employee.status} size="sm" />
                  </button>
                ))}
              </div>
            )}

            {filteredEmployees.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-gray-500">
                  No employees found matching your search.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
