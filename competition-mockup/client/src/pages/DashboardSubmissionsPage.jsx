import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import SubmissionsTable from "../components/dashboard/SubmissionsTable";

const DashboardSubmissionsPage = () => {
  return (
    <DashboardLayout activeTab="submissions">
      <SubmissionsTable />
    </DashboardLayout>
  );
};

export default DashboardSubmissionsPage;
