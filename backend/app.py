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

        # Convert request → DataFrame
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

        print("\n===== FEATURES AFTER ENGINEERING =====")
        print(df.T)

        # -----------------------------------
        # IMPORTANT:
        # DO NOT manually align columns.
        # Pipeline already handles encoding.
        # Just send raw dataframe.
        # -----------------------------------

        prob = model.predict_proba(df)[0]
        prob_map = dict(zip(model.classes_, prob))

        reject_prob = round(prob_map["Rejected"] * 100, 1)
        approve_prob = round(prob_map["Approved"] * 100, 1)

        print("\nMODEL OUTPUT:", prob_map)

        # -----------------------------------
        # Business Logic (your explainability)
        # -----------------------------------
        credit_score = float(data.get("credit_score", 0))
        defaults = str(data.get("previous_loan_defaults_on_file", "no")).lower()

        if approve_prob >= reject_prob:
            decision = "Approved ✅"
        else:
            decision = "Rejected ❌"

        reasons = []
        suggestions = []

        if credit_score < 650:
            reasons.append("Low credit score")
            suggestions.append("Improve credit score above 650.")

        if dti > 0.35:
            reasons.append("High debt-to-income ratio")
            suggestions.append("Reduce existing debts.")

        if defaults == "yes":
            reasons.append("Previous loan default history")
            suggestions.append("Maintain clean repayment.")

        return jsonify({
            "decision": decision,
            "approve_probability": approve_prob,
            "reject_probability": reject_prob,
            "reasons": reasons,
            "suggestions": suggestions
        })

    except Exception as e:

        print("❌ PREDICTION ERROR:", e)

        return jsonify({
            "decision": "Error ❌",
            "approve_probability": 0,
            "reject_probability": 0,
            "reasons": [],
            "suggestions": [],
            "error": str(e)
        })
