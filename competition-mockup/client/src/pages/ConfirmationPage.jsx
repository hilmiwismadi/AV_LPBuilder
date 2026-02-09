import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { colors } from "../utils/colors";

const ConfirmationPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/dashboard/transactions");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "#D1FAE5" }}
        >
          <svg 
            className="w-10 h-10"
            style={{ color: "#059669" }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 
          className="text-2xl font-bold mb-2"
          style={{ color: colors.neutral.dark }}
        >
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Your registration has been completed successfully. We have sent a confirmation email with your ticket details.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">Registration ID:</span> REG-{Date.now()}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Event:</span> {slug.replace(/-/g, " ").toUpperCase()}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleBackToDashboard}
            className="w-full py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: colors.primary.purple }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/event/" + slug + "/order-form")}
            className="w-full py-3 border rounded-lg font-semibold"
            style={{ 
              borderColor: colors.primary.purple,
              color: colors.primary.purple 
            }}
          >
            Register Another
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
