import React, { useState, useRef, useEffect } from "react";
import { Search, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserManagementSearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allRoles: string[];
  selectedRole: string | null;
  onRoleSelect: (role: string | null) => void;
  loading?: boolean;
}

const UserManagementSearchAndFilter: React.FC<UserManagementSearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  allRoles,
  selectedRole,
  onRoleSelect,
  loading = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const selectedRoleLabel = selectedRole === null ? "Бүгд" : selectedRole;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Хэрэглэгч хайх..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={loading}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-50"
          />
        </div>
        <div className="relative" ref={dropdownRef}>
          <Button
            variant={selectedRole === null ? "default" : "outline"}
            size="sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="whitespace-nowrap min-w-[150px] justify-between"
            disabled={loading}
          >
            <div className="flex items-center gap-2">
              {selectedRole !== null && <Shield className="h-3 w-3" />}
              <span>{selectedRoleLabel}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
          {isDropdownOpen && !loading && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-50 max-h-60 overflow-y-auto">
              <div className="p-1">
                <button
                  onClick={() => {
                    onRoleSelect(null);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedRole === null
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>Бүгд</span>
                </button>
                {allRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleSelect(role);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedRole === role
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    <span>{role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {loading && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
              <div className="p-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-full bg-slate-200 rounded-md animate-pulse mb-1"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementSearchAndFilter;

