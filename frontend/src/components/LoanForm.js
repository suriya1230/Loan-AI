import React, { useState } from "react";
import axios from "axios";

function LoanForm() {

  const [formData, setFormData] = useState({
    person_age: "",
    person_gender: "male",
    person_education: "High School",
    person_income: "",
    person_emp_exp: "",
    person_home_ownership: "RENT",

    loan_amnt: "",
    loan_intent: "PERSONAL",
    loan_int_rate: "",

    cb_person_cred_hist_length: "",
    credit_score: "",

    previous_loan_defaults_on_file: "no",
    credit_risk_category: "LOW"
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // =====================
  // Handle Change
  // =====================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // =====================
  // Auto Calculations
  // =====================
  const income = Number(formData.person_income || 0);
  const loan = Number(formData.loan_amnt || 0);
  const rate = Number(formData.loan_int_rate || 0);

  const monthlyIncome = income / 12;
  const monthlyRate = rate / 12 / 100;
  const n = 12;

  const emi =
    monthlyRate === 0
      ? loan / n
      : (loan * monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1);

  const dti = monthlyIncome > 0 ? emi / monthlyIncome : 0;
  const loanPercentIncome = income > 0 ? loan / income : 0;

  // =====================
  // Submit
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const payload = {
      ...formData,

      person_age: Number(formData.person_age),
      person_income: income,
      person_emp_exp: Number(formData.person_emp_exp),
      loan_amnt: loan,
      loan_int_rate: rate,
      cb_person_cred_hist_length: Number(formData.cb_person_cred_hist_length),
      credit_score: Number(formData.credit_score),

      monthly_income: monthlyIncome,
      loan_percent_income: loanPercentIncome,
      emi: emi,
      dti: dti
    };

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/predict",
        payload
      );

      setResult(res.data);

    } catch (err) {
      alert("Backend error — make sure Flask is running!");
    }

    setLoading(false);
  };

  // =====================
  // UI
  // =====================
  return (
    <div className="p-8 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Loan Application Form
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-6 rounded-xl grid grid-cols-2 gap-4"
      >

        {/* Personal */}
        <input type="number" name="person_age"
          placeholder="Age" onChange={handleChange}
          className="p-3 rounded text-black" required />

        <select name="person_gender"
          onChange={handleChange}
          className="p-3 rounded text-black">
          <option>male</option>
          <option>female</option>
        </select>

        <select name="person_education"
          onChange={handleChange}
          className="p-3 rounded text-black">
          <option>High School</option>
          <option>Bachelor</option>
          <option>Master</option>
          <option>PhD</option>
        </select>

        <input type="number" name="person_emp_exp"
          placeholder="Employment Years"
          onChange={handleChange}
          className="p-3 rounded text-black" />

        <input type="number" name="person_income"
          placeholder="Annual Income"
          onChange={handleChange}
          className="p-3 rounded text-black" required />

        <select name="person_home_ownership"
          onChange={handleChange}
          className="p-3 rounded text-black">
          <option>RENT</option>
          <option>OWN</option>
          <option>MORTGAGE</option>
        </select>

        {/* Loan */}
        <input type="number" name="loan_amnt"
          placeholder="Loan Amount"
          onChange={handleChange}
          className="p-3 rounded text-black" required />

        <select name="loan_intent"
          onChange={handleChange}
          className="p-3 rounded text-black">
          <option>PERSONAL</option>
          <option>EDUCATION</option>
          <option>MEDICAL</option>
          <option>VENTURE</option>
          <option>HOMEIMPROVEMENT</option>
          <option>DEBTCONSOLIDATION</option>
        </select>

        <input type="number" step="0.01"
          name="loan_int_rate"
          placeholder="Interest Rate (%)"
          onChange={handleChange}
          className="p-3 rounded text-black" required />

        <input type="number" name="credit_score"
          placeholder="Credit Score"
          onChange={handleChange}
          className="p-3 rounded text-black" />

        <input type="number"
          name="cb_person_cred_hist_length"
          placeholder="Credit History Length"
          onChange={handleChange}
          className="p-3 rounded text-black" />

        <select name="previous_loan_defaults_on_file"
          onChange={handleChange}
          className="p-3 rounded text-black">
          <option value="no">No Defaults</option>
          <option value="yes">Has Defaults</option>
        </select>

        <select name="credit_risk_category"
          onChange={handleChange}
          className="p-3 rounded text-black">
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
        </select>

        {/* Auto Summary */}
        <div className="col-span-2 bg-white/20 p-4 rounded">
          <p>Monthly Income: {monthlyIncome.toFixed(2)}</p>
          <p>EMI: {emi.toFixed(2)}</p>
          <p>DTI: {dti.toFixed(2)}</p>
        </div>

        <button
          className="col-span-2 bg-blue-500 py-3 rounded font-bold"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

      </form>

      {/* Result */}
      {result && (
        <div className="mt-6 bg-white/10 p-4 rounded">
          <h2 className="text-xl">{result.decision}</h2>
          <p>Approve: {result.approve_probability}%</p>
          <p>Reject: {result.reject_probability}%</p>

          <h3 className="mt-2">Reasons:</h3>
          {result.reasons.map((r, i) => <p key={i}>• {r}</p>)}

          <h3 className="mt-2">Suggestions:</h3>
          {result.suggestions.map((s, i) => <p key={i}>• {s}</p>)}
        </div>
      )}

    </div>
  );
}

export default LoanForm;
