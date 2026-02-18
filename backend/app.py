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

        # -------------------------
        # Convert to DataFrame
        # -------------------------
        df = pd.DataFrame([data])

        print("\n===== RAW INPUT =====")
        print(df.T)

        # -------------------------
        # TYPE FIX (VERY IMPORTANT)
        # -------------------------

        numeric_cols = [
            "person_age",
            "person_income",
            "person_emp_exp",
            "loan_amnt",
            "loan_int_rate",
            "credit_score",
            "cb_person_cred_hist_length",
            "monthly_income",
            "loan_percent_income",
            "emi",
            "dti"
        ]

        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # Convert categorical columns STRICTLY to string
        categorical_cols = [
            "person_gender",
            "person_education",
            "person_home_ownership",
            "loan_intent",
            "previous_loan_defaults_on_file",
            "credit_risk_category"
        ]

        for col in categorical_cols:
            if col in df.columns:
                df[col] = df[col].astype(str)

        # -------------------------
        # ALIGN WITH TRAINED PIPELINE
        # -------------------------
        expected_columns = model.feature_names_in_

        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0

        df = df[expected_columns]

        print("\n===== FINAL MODEL INPUT =====")
        print(df.T)

        # -------------------------
        # Prediction
        # -------------------------
        prob = model.predict_proba(df)[0]
        prob_map = dict(zip(model.classes_, prob))

        reject_prob = round(prob_map["Rejected"] * 100, 1)
        approve_prob = round(prob_map["Approved"] * 100, 1)

        decision = "Approved ✅" if approve_prob >= reject_prob else "Rejected ❌"

        return jsonify({
            "decision": decision,
            "approve_probability": approve_prob,
            "reject_probability": reject_prob,
            "reasons": [],
            "suggestions": []
        })

    except Exception as e:

        print("❌ FULL ERROR:", str(e))

        return jsonify({
            "decision": "Error ❌",
            "approve_probability": 0,
            "reject_probability": 0,
            "reasons": [],
            "suggestions": [],
            "error": str(e)
        })
