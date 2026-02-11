import React from "react";
import LoanForm from "../components/LoanForm";

function ApplyLoan() {
  return (
    <div className="min-h-screen text-white px-12 py-10">
      <h1 className="text-4xl font-bold mb-8">
        Loan Application Form
      </h1>

      <LoanForm />
    </div>
  );
}

export default ApplyLoan;
