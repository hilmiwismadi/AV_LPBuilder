import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import FinancialSummary from "../components/dashboard/FinancialSummary";
import TransactionsTable from "../components/dashboard/TransactionsTable";

const DashboardTransactionsPage = () => {
  return (
    <DashboardLayout activeTab="transactions">
      <FinancialSummary />
      <TransactionsTable />
    </DashboardLayout>
  );
};

export default DashboardTransactionsPage;
