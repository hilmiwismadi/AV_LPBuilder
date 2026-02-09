import React from "react";

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "scored":
        return "bg-purple-100 text-purple-800";
      case "pending review":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={"px-3 py-1 rounded-full text-xs font-medium " + getStatusColor(status)}>
      {status}
    </span>
  );
};

export default StatusBadge;
