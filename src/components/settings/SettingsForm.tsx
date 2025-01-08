// WHY: Settings management needs a comprehensive form with validation
// WHAT: Form component for configuring PTO settings with real-time validation
// NOTE: Handles both initial setup and settings updates

import React, { useState } from "react";
import { Settings } from "lucide-react";
import { PTOSettings, AccrualPeriodType } from "../../types";
import { DEFAULT_SETTINGS } from "../../hooks/usePtoSettings";

// WHY: Form needs to track multiple validation errors simultaneously
// WHAT: Defines possible validation error messages for each field
interface ValidationErrors {
  currentBalance?: string;
  accrualRate?: string;
  accrualPeriodType?: string;
  lastAccrualDate?: string;
  maxBalance?: string;
  maxRollover?: string;
}

// WHY: Component needs to handle both creation and editing flows
interface SettingsFormProps {
  onSave: (settings: PTOSettings) => void; // Callback for saving settings
  initialSettings?: PTOSettings; // Optional existing settings for editing
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  onSave,
  initialSettings,
}) => {
  // WHY: Form needs to handle both new settings and editing existing ones
  // WHAT: Initializes form state with proper handling of Infinity values
  // NOTE: Uses DEFAULT_SETTINGS for new settings creation
  const [formData, setFormData] = useState<PTOSettings>(() => {
    if (initialSettings) {
      return {
        ...initialSettings,
        // WHY: UI can't display Infinity, so convert to 0 for display
        maxRollover:
          initialSettings.maxRollover === Infinity
            ? 0
            : initialSettings.maxRollover,
        maxBalance:
          initialSettings.maxBalance === Infinity
            ? 0
            : initialSettings.maxBalance,
      };
    }
    return DEFAULT_SETTINGS;
  });

  // WHY: Need separate display values to handle empty states better
  // WHAT: Manages display-specific values for numeric inputs
  // NOTE: Allows empty string display while maintaining 0 in actual data
  const [displayValues, setDisplayValues] = useState({
    currentBalance:
      formData.currentBalance === 0 ? "" : formData.currentBalance.toString(),
    accrualRate:
      formData.accrualRate === 0 ? "" : formData.accrualRate.toString(),
  });

  // WHY: Need to track validation errors for form fields
  const [errors, setErrors] = useState<ValidationErrors>({});

  // WHY: Need to check form validity before saving
  // NOTE: Form is valid when there are no validation errors
  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Validate required fields
    if (!displayValues.currentBalance) {
      newErrors.currentBalance = "Current balance is required";
    }
    if (!displayValues.accrualRate) {
      newErrors.accrualRate = "Accrual rate is required";
    }
    if (!formData.accrualPeriodType) {
      newErrors.accrualPeriodType = "Accrual period type is required";
    }
    if (!formData.lastAccrualDate) {
      newErrors.lastAccrualDate = "Last accrual date is required";
    }

    // Add new validation errors
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // WHY: Native form submissions need to be handled properly in React
  // WHAT: Captures form submission event and triggers save logic
  // NOTE: Prevents page refresh while maintaining form accessibility
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    handleSaveClick(); // Your existing save logic
  };

  // WHY: Need to process form data before saving
  // WHAT: Handles conversion between UI representation and stored values
  const handleSaveClick = () => {
    if (validateForm()) {
      const processedData = {
        ...formData,
        // WHY: Convert empty max values to 0 for consistency
        maxRollover: formData.hasMaxRollover ? formData.maxRollover : 0,
        maxBalance: formData.hasMaxBalance ? formData.maxBalance : 0,
      };

      onSave({
        ...processedData,
        // WHY: Convert 0 to Infinity for unlimited values in storage
        maxRollover:
          processedData.maxRollover === 0
            ? Infinity
            : processedData.maxRollover,
        maxBalance:
          processedData.maxBalance === 0 ? Infinity : processedData.maxBalance,
      });
    }
  };

  // WHY: Need a responsive, accessible form layout
  // WHAT: Container with card-style form and consistent spacing
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold">OOOly Settings</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* WHY: Current balance needs decimal precision for accurate tracking
              WHAT: Number input with validation and empty state handling 
              NOTE: Input removes spinner buttons for cleaner look */}
          <div>
            <label className="block mb-2">
              Current Balance (hours) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 13.85"
              value={displayValues.currentBalance}
              onChange={(e) => {
                const value = e.target.value;
                // WHY: Only allow valid decimal numbers
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setDisplayValues((prev) => ({
                    ...prev,
                    currentBalance: value,
                  }));
                  setFormData((prev) => ({
                    ...prev,
                    currentBalance: value === "" ? 0 : parseFloat(value || "0"),
                  }));
                  if (errors.currentBalance) {
                    setErrors((prev) => ({
                      ...prev,
                      currentBalance: undefined,
                    }));
                  }
                }
              }}
              onFocus={(e) => e.target.select()}
              className={`w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                errors.currentBalance ? "border-red-500" : ""
              }`}
            />
            {errors.currentBalance && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentBalance}
              </p>
            )}
          </div>

          {/* WHY: Accrual rate needs similar decimal handling to current balance
              NOTE: This could be refactored to share logic with current balance input */}
          <div>
            <label className="block mb-2">
              Accrual Rate (hours per period){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="e.g. 2.77"
              value={displayValues.accrualRate}
              onChange={(e) => {
                const value = e.target.value;
                // WHY: Only allow valid decimal numbers
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setDisplayValues((prev) => ({
                    ...prev,
                    accrualRate: value,
                  }));
                  setFormData((prev) => ({
                    ...prev,
                    accrualRate: value === "" ? 0 : parseFloat(value || "0"),
                  }));
                  if (errors.accrualRate) {
                    setErrors((prev) => ({
                      ...prev,
                      accrualRate: undefined,
                    }));
                  }
                }
              }}
              onFocus={(e) => e.target.select()}
              className={`w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                errors.accrualRate ? "border-red-500" : ""
              }`}
            />
            {errors.accrualRate && (
              <p className="text-red-500 text-sm mt-1">{errors.accrualRate}</p>
            )}
          </div>

          {/* WHY: Different companies have different pay period schedules
              WHAT: Simple select for accrual period configuration */}
          <div>
            <label className="block mb-2">
              Accrual Period Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.accrualPeriodType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  accrualPeriodType: e.target.value as AccrualPeriodType,
                }))
              }
              className={`w-full p-2 border rounded bg-white appearance-none ${
                errors.accrualPeriodType ? "border-red-500" : ""
              }`}
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="semi-monthly">Semi-monthly</option>
            </select>
            {errors.accrualPeriodType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.accrualPeriodType}
              </p>
            )}
          </div>

          {/* WHY: Need to track when PTO was last added to balance
              WHAT: Date picker limited to past dates
              NOTE: Uses ISO string split to handle date-only value */}
          <div>
            <label className="block mb-2">
              Last Accrual Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.lastAccrualDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  lastAccrualDate: e.target.value,
                }))
              }
              className={`w-full p-2 border rounded bg-white appearance-none ${
                errors.lastAccrualDate ? "border-red-500" : ""
              }`}
            />
            {errors.lastAccrualDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastAccrualDate}
              </p>
            )}
          </div>

          {/* WHY: Companies may limit PTO rollover between years
              WHAT: Optional numeric input that toggles max rollover functionality
              NOTE: Empty value means no maximum (converts to Infinity) */}
          <div>
            <label className="block mb-2">Maximum Rollover Hours</label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={formData.hasMaxRollover ? formData.maxRollover : ""}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue = value === "" ? 0 : parseInt(value, 10);
                setFormData((prev) => ({
                  ...prev,
                  maxRollover: parsedValue,
                  hasMaxRollover: value !== "",
                }));

                if (value === "") {
                  setErrors((prev) => {
                    const { maxRollover, ...rest } = prev;
                    return rest;
                  });
                } else if (parsedValue < 0) {
                  setErrors((prev) => ({
                    ...prev,
                    maxRollover: "Maximum rollover cannot be negative",
                  }));
                } else if (
                  formData.hasMaxBalance &&
                  parsedValue > formData.maxBalance
                ) {
                  setErrors((prev) => ({
                    ...prev,
                    maxRollover:
                      "Maximum rollover cannot exceed maximum balance",
                  }));
                } else {
                  setErrors((prev) => {
                    const { maxRollover, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              onFocus={(e) => e.target.select()}
              className={`w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                errors.maxRollover ? "border-red-500" : ""
              }`}
              placeholder="No maximum"
            />
            {errors.maxRollover && (
              <p className="text-red-500 text-sm mt-1">{errors.maxRollover}</p>
            )}
          </div>

          {/* WHY: Companies may limit total PTO balance
              WHAT: Optional numeric input that toggles max balance functionality
              NOTE: Empty value means no maximum (converts to Infinity) */}
          <div>
            <label className="block mb-2">Maximum Balance</label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={formData.hasMaxBalance ? formData.maxBalance : ""}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue = value === "" ? 0 : parseInt(value, 10);
                setFormData((prev) => ({
                  ...prev,
                  maxBalance: parsedValue,
                  hasMaxBalance: value !== "",
                }));

                if (value === "") {
                  setErrors((prev) => {
                    const { maxBalance, currentBalance, ...rest } = prev;
                    return rest;
                  });
                } else if (parsedValue < 0) {
                  setErrors((prev) => ({
                    ...prev,
                    maxBalance: "Maximum balance cannot be negative",
                  }));
                } else {
                  // WHY: Need to validate current balance against new maximum
                  // WHAT: Clears maxBalance error and checks current balance
                  setErrors((prev) => {
                    const { maxBalance, ...rest } = prev;

                    if (formData.currentBalance > parsedValue) {
                      return {
                        ...rest,
                        currentBalance:
                          "Current balance cannot exceed maximum balance",
                      };
                    }

                    // If all good, remove currentBalance error too
                    const { currentBalance, ...finalRest } = rest;
                    return finalRest;
                  });
                }
              }}
              onFocus={(e) => e.target.select()}
              className={`w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                errors.maxBalance ? "border-red-500" : ""
              }`}
              placeholder="No maximum"
            />
            {errors.maxBalance && (
              <p className="text-red-500 text-sm mt-1">{errors.maxBalance}</p>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-4">
            <span className="text-red-500">*</span> Required fields
          </p>

          {/* WHY: Form submission needs clear action and validation state
              WHAT: Submit button disabled when form has errors */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};
