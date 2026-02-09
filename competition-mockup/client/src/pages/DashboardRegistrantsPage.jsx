import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import RegistrantsTable from "../components/dashboard/RegistrantsTable";

const DashboardRegistrantsPage = () => {
  return (
    <DashboardLayout activeTab="registrants">
      <RegistrantsTable />
    </DashboardLayout>
  );
};

export default DashboardRegistrantsPage;
