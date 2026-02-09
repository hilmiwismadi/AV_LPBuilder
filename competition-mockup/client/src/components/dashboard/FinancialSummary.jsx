import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { colors } from "../../utils/colors";

const FinancialSummary = () => {
  const [financials, setFinancials] = useState(null);

  useEffect(() => {
    api.get("/dashboard/financials")
      .then(res => setFinancials(res.data))
      .catch(err => console.error("Error fetching financials:", err));
  }, []);

  if (!financials) return <div>Loading...</div>;

  const formatCurrency = (amount) => {
    return "Rp " + amount.toLocaleString("id-ID");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
        <p className="text-2xl font-bold mt-2" style={{ color: colors.neutral.dark }}>
          {formatCurrency(financials.totalRevenue)}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm font-medium">Platform Fee (5%)</h3>
        <p className="text-2xl font-bold mt-2" style={{ color: "#DC2626" }}>
          {formatCurrency(financials.platformFee)}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm font-medium">Net Amount</h3>
        <p className="text-2xl font-bold mt-2" style={{ color: "#16A34A" }}>
          {formatCurrency(financials.netAmount)}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm font-medium">Withdrawable</h3>
        <p className="text-2xl font-bold mt-2" style={{ color: colors.primary.purple }}>
          {formatCurrency(financials.withdrawable)}
        </p>
        <button 
          className="mt-3 w-full py-2 text-white rounded-lg hover:opacity-90 text-sm"
          style={{ backgroundColor: colors.primary.purple }}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default FinancialSummary;
