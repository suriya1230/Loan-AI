from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from model_columns import MODEL_COLUMNS


# ======================================
# Flask Setup
# ======================================
app = Flask(__name__)
CORS(app)

# ======================================
# Load Model
# ======================================
MODEL_PATH = "model/loan_approval_pipeline.pkl"

try:
    model = joblib.load(MODEL_PATH)
    class_labels = model.classes_
    print("✅ Model Loaded:", class_labels)
except Exception as e:
    print("❌ Model load error:", e)


# ======================================
# Feature Engineering Function
# ======================================
def engineer_features(df):

    income = float(df["person_income"].iloc[0])
    loan = float(df["loan_amnt"].iloc[0])
    rate = float(df["loan_int_rate"].iloc[0])

    monthly_income = income / 12 if income > 0 else 0
    monthly_rate = rate / 12 / 100

    emi = loan * monthly_rate
    dti = emi / monthly_income if monthly_income > 0 else 0
    loan_ratio = loan / income if income > 0 else 0

    df["monthly_income"] = monthly_income
    df["monthly_interest_rate"] = monthly_rate
    df["emi"] = emi
    df["dti"] = dti
    df["loan_percent_income"] = loan_ratio

    return df


# ======================================
# Home Route
# ======================================
@app.route("/")
def home():
    return "Loan Approval API Running ✅"


# ======================================
# Prediction Route
# ======================================
@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.json

        # Convert to DataFrame
        df = pd.DataFrame([data])

        print("\n===== RAW INPUT FROM FRONTEND =====")
        print(df.T)

        # -----------------------------------
        # SAME FEATURE ENGINEERING AS TRAINING
        # -----------------------------------
        income = float(df["person_income"].iloc[0])
        loan = float(df["loan_amnt"].iloc[0])
        rate = float(df["loan_int_rate"].iloc[0])

        monthly_income = income / 12 if income > 0 else 0
        monthly_rate = rate / 12 / 100
        emi = loan * monthly_rate
        dti = emi / monthly_income if monthly_income > 0 else 0
        loan_ratio = loan / income if income > 0 else 0

        df["monthly_income"] = monthly_income
        df["monthly_interest_rate"] = monthly_rate
        df["emi"] = emi
        df["dti"] = dti
        df["loan_percent_income"] = loan_ratio

        # -----------------------------------
        # ALIGN WITH TRAINED PIPELINE
        # -----------------------------------
        expected_columns = model.feature_names_in_

        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0

        df = df[expected_columns]

        print("\n===== FINAL MODEL INPUT =====")
        print(df.T)

        # -----------------------------------
        # MODEL PREDICTION
        # -----------------------------------
        prob = model.predict_proba(df)[0]
        prob_map = dict(zip(model.classes_, prob))

        reject_prob = round(prob_map["Rejected"] * 100, 1)
        approve_prob = round(prob_map["Approved"] * 100, 1)

        print("\nMODEL OUTPUT:", prob_map)

        # -----------------------------------
        # BUSINESS DECISION LOGIC
        # -----------------------------------
        credit_score = float(data.get("credit_score", 0))
        defaults = str(data.get("previous_loan_defaults_on_file", "no")).lower()
        interest = float(data.get("loan_int_rate", 0))
        emp_exp = float(data.get("person_emp_exp", 0))
        home = data.get("person_home_ownership", "")
        risk = data.get("credit_risk_category", "")

        if approve_prob >= 60:
            decision = "Approved ✅"
        elif reject_prob >= 60:
            decision = "Rejected ❌"
        else:
            decision = "Borderline ⚠️"

        # Hard rejection rules
        if credit_score < 600 or dti > 0.50 or defaults == "yes":
            decision = "Rejected ❌"

        # Strong approval override
        if (credit_score >= 720 and dti <= 0.25 and defaults == "no"
            and loan_ratio <= 0.30 and emp_exp >= 2 and risk.upper() == "LOW"):
            decision = "Approved ✅"
            approve_prob = 95.0
            reject_prob = 5.0

        # -----------------------------------
        # EXPLANATIONS
        # -----------------------------------
        reasons = []
        suggestions = []

        if credit_score < 650:
            reasons.append("Low credit score")
            suggestions.append("Improve credit score above 650.")

        if dti > 0.35:
            reasons.append("High debt-to-income ratio")
            suggestions.append("Reduce existing debts.")

        if loan_ratio > 0.30:
            reasons.append("Loan amount too high compared to income")
            suggestions.append("Reduce loan amount.")

        if emp_exp < 2:
            reasons.append("Not enough employment experience")
            suggestions.append("Gain stable job experience.")

        if interest > 15:
            reasons.append("Interest rate is too high")
            suggestions.append("Apply for lower interest loan.")

        if risk.upper() == "HIGH":
            reasons.append("High credit risk category")
            suggestions.append("Improve financial profile.")

        if home == "RENT":
            reasons.append("Rent-based repayment risk")
            suggestions.append("Provide co-applicant.")

        if defaults == "yes":
            reasons.append("Previous loan default history")
            suggestions.append("Maintain clean repayment.")

        if decision.startswith("Rejected") and not reasons:
            reasons.append("Model detected financial risk")
            suggestions.append("Review financial profile.")

        # -----------------------------------
        # RESPONSE
        # -----------------------------------
        return jsonify({
            "decision": decision,
            "approve_probability": approve_prob,
            "reject_probability": reject_prob,
            "reasons": reasons,
            "suggestions": suggestions
        })

    except Exception as e:
        print("❌ ERROR:", e)

        return jsonify({
            "decision": "Error ❌",
            "approve_probability": 0,
            "reject_probability": 0,
            "reasons": [],
            "suggestions": [],
            "error": str(e)
        })

