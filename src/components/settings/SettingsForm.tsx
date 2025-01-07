import React, { useState } from "react";
import { Settings } from "lucide-react";
import { PTOSettings, AccrualPeriodType } from "../../types";

interface ValidationErrors {
  currentBalance?: string;
  maxBalance?: string;
  maxRollover?: string;
}

interface SettingsFormProps {
  onSave: (settings: PTOSettings) => void;
  initialSettings?: PTOSettings;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  onSave,
  initialSettings,
}) => {
  const [formData, setFormData] = useState<PTOSettings>(() => {
    if (initialSettings) {
      return {
        ...initialSettings,
        // Convert Infinity to undefined but preserve 0
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
    return {
      currentBalance: 0,
      accrualRate: 0,
      accrualPeriodType: "biweekly",
      lastAccrualDate: new Date().toISOString().split("T")[0],
      hasMaxRollover: false,
      maxRollover: 0,
      hasMaxBalance: false,
      maxBalance: 0,
    };
  });

  const [displayValues, setDisplayValues] = useState({
    currentBalance:
      formData.currentBalance === 0 ? "" : formData.currentBalance.toString(),
    accrualRate:
      formData.accrualRate === 0 ? "" : formData.accrualRate.toString(),
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = () => {
    return Object.keys(errors).length === 0;
    return Object.keys(errors).length === 0;
  };

  const handleSaveClick = () => {
    if (validateForm()) {
      const processedData = {
        ...formData,
        // Use 0 as default value when not using max values
        maxRollover: formData.hasMaxRollover ? formData.maxRollover : 0,
        maxBalance: formData.hasMaxBalance ? formData.maxBalance : 0,
      };

      onSave({
        ...processedData,
        // Convert to Infinity only when saving
        maxRollover:
          processedData.maxRollover === 0
            ? Infinity
            : processedData.maxRollover,
        maxBalance:
          processedData.maxBalance === 0 ? Infinity : processedData.maxBalance,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold">OOOly Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">Current Balance (hours)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 13.85"
              value={displayValues.currentBalance}
              onChange={(e) => {
                const value = e.target.value;
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
              onBlur={(e) => {
                if (e.target.value === "") {
                  setFormData((prev) => ({
                    ...prev,
                    currentBalance: 0,
                  }));
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

          <div>
            <label className="block mb-2">
              Accrual Rate (hours per period)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="e.g. 2.77"
              value={displayValues.accrualRate}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setDisplayValues((prev) => ({
                    ...prev,
                    accrualRate: value,
                  }));
                  setFormData((prev) => ({
                    ...prev,
                    accrualRate: value === "" ? 0 : parseFloat(value || "0"),
                  }));
                }
              }}
              onBlur={(e) => {
                if (e.target.value === "") {
                  setFormData((prev) => ({
                    ...prev,
                    accrualRate: 0,
                  }));
                }
              }}
              onFocus={(e) => e.target.select()}
              className="w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block mb-2">Accrual Period Type</label>
            <select
              value={formData.accrualPeriodType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  accrualPeriodType: e.target.value as AccrualPeriodType,
                }))
              }
              className="w-full p-2 border rounded bg-white appearance-none"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="semi-monthly">Semi-monthly</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Last Accrual Date</label>
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
              className="w-full p-2 border rounded bg-white appearance-none"
            />
          </div>

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

                console.log("MaxRollover onChange:", {
                  value,
                  parsedValue,
                  hasMaxRollover: value !== "",
                  currentErrors: errors,
                });

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
            {errors.maxRollover && (
              <p className="text-red-500 text-sm mt-1">{errors.maxRollover}</p>
            )}
          </div>

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

                console.log("MaxBalance onChange:", {
                  value,
                  parsedValue,
                  hasMaxBalance: value !== "",
                  currentErrors: errors,
                });

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
                  // Clear maxBalance error first
                  setErrors((prev) => {
                    const { maxBalance, ...rest } = prev;

                    // Check if current balance exceeds new max balance
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
            {errors.maxBalance && (
              <p className="text-red-500 text-sm mt-1">{errors.maxBalance}</p>
            )}
          </div>

          <button
            onClick={handleSaveClick}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={Object.keys(errors).length > 0}
            onMouseOver={() =>
              console.log("Current errors preventing save:", errors)
            }
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
