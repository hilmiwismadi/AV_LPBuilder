import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { colors } from "../../utils/colors";

const RegistrantsTable = () => {
  const [registrants, setRegistrants] = useState([]);

  useEffect(() => {
    api.get("/dashboard/registrants")
      .then(res => setRegistrants(res.data))
      .catch(err => console.error("Error:", err));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const openSpreadsheet = () => {
    window.open("https://docs.google.com/spreadsheets/d/example", "_blank");
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">All Registrants</h2>
        <button
          onClick={openSpreadsheet}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
          style={{ backgroundColor: colors.primary.purple }}
        >
          Open Spreadsheet
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                WhatsApp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tickets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrants.map(reg => (
              <tr key={reg.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reg.buyerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {reg.buyerEmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {reg.buyerWhatsApp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  KTP
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {reg.buyerNIK}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reg.tickets.map((t, i) => (
                    <div key={i} className="text-xs">
                      {t.ticketType} {t.tshirtSize ? `(${t.tshirtSize})` : ""}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Rp {reg.totalAmount.toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={"px-2 py-1 rounded-full text-xs font-medium " + 
                    (reg.status === "Completed" ? "bg-green-100 text-green-800" :
                     reg.status === "Paid" ? "bg-blue-100 text-blue-800" :
                     "bg-yellow-100 text-yellow-800")}>
                    {reg.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(reg.registrationDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrantsTable;
