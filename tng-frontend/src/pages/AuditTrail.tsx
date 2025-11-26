import { ArrowLeft, Search, Shield } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { useNavigate } from "../hooks/useNavigate";
import type { AuditLog } from "../types";

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    employee_id: "EMP001",
    action: "Time In Override",
    performed_by: "admin@company.com",
    timestamp: "2025-11-26T09:00:00Z",
    details: "Updated time-in from 09:15 to 09:00",
  },
  {
    id: "2",
    employee_id: "EMP002",
    action: "Attendance Record Modified",
    performed_by: "hr@company.com",
    timestamp: "2025-11-26T10:30:00Z",
    details: "Changed status from absent to late",
  },
  {
    id: "3",
    employee_id: "EMP003",
    action: "Manual Time Out",
    performed_by: "admin@company.com",
    timestamp: "2025-11-26T18:00:00Z",
    details: "Added time-out entry for missed tap",
  },
];

export function AuditTrail() {
  const navigate = useNavigate();
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter(
    (log) =>
      log.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performed_by.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-xl font-bold text-gray-900">Audit Trail</h1>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Secure Activity Log</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee ID, action, or admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">
              All Activities
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {log.action}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Employee: {log.employee_id}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {log.details && (
                      <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
                        {log.details}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <Avatar size="sm" fallback="AD" />
                      <span className="text-xs text-gray-600">
                        Performed by{" "}
                        <span className="font-medium text-gray-900">
                          {log.performed_by}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No audit logs found matching your search.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} audit entries
          </p>
        </div>
      </main>
    </div>
  );
}
