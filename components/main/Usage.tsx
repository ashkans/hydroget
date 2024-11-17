"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

interface AccountingData {
  total_simulations: number;
  simulation_limit: number;
  remaining_simulations: number;
}

export const UserProfilePage = () => {
  const [accounting, setAccounting] = useState<AccountingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();

  const fetchAccounting = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get("/api/py/get_accounting", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem("accounting-data", JSON.stringify(response.data));
      setAccounting(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = localStorage.getItem("accounting-data");
    if (cachedData) {
      setAccounting(JSON.parse(cachedData));
    } else {
      fetchAccounting();
    }
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Usage</h1>
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={fetchAccounting}
          className="mt-2 p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
        </button>
      </div>
    );
  }

  if (!accounting) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Usage</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Usage</h1>
        <button
          onClick={fetchAccounting}
          className="p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span>Simulations Used</span>
            <span>
              {accounting.total_simulations.toLocaleString()} /{" "}
              {accounting.simulation_limit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${
                  (accounting.total_simulations / accounting.simulation_limit) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            Remaining simulations:{" "}
            {accounting.remaining_simulations.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
