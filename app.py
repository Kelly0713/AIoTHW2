"""
AIoTHW2 - Web Application for Flood Risk Prediction (CRISP-DM Deployment)
Multiple Linear Regression with Confidence Interval (CI) & Prediction Interval (PI)
"""
import os
import json
import pickle
import numpy as np
from scipy import stats
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Load Model and Metadata
METADATA_PATH = 'models/model_metadata.json'
MODEL_PKL_PATH = 'models/regression_model.pkl'

with open(METADATA_PATH, 'r', encoding='utf-8') as f:
    model_metadata = json.load(f)

with open(MODEL_PKL_PATH, 'rb') as f:
    model_artifacts = pickle.load(f)

features = model_metadata['features']
coefficients = np.array(model_metadata['coefficients'])
intercept = float(model_metadata['intercept'])
XtX_inv = np.array(model_metadata['XtX_inv'])
residual_std = float(model_metadata['residual_std'])
dof = int(model_metadata['dof'])
t_crit = stats.t.ppf(1 - 0.05 / 2, df=dof)

feature_means = model_metadata['feature_means']
feature_mins = model_metadata['feature_mins']
feature_maxs = model_metadata['feature_maxs']

@app.route('/')
def index():
    return render_template('index.html', metadata=model_metadata)

@app.route('/api/model_info', methods=['GET'])
def get_model_info():
    return jsonify({
        'status': 'success',
        'data': model_metadata
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        req_data = request.get_json(force=True)
        inputs = req_data.get('features', {})
        model_choice = req_data.get('model_choice', 'full_ols') # 'full_ols' or 'top_14_rfe'

        # Build feature vector
        x_vec = []
        for feat in features:
            val = float(inputs.get(feat, feature_means.get(feat, 5.0)))
            x_vec.append(val)
        x_vec = np.array(x_vec)

        if model_choice == 'top_14_rfe':
            # Top 14 Model
            top_14 = model_metadata['top_14_features']
            top_14_coef = np.array(model_metadata['top_14_coefficients'])
            top_14_intercept = float(model_metadata['top_14_intercept'])
            x_sub = np.array([inputs.get(f, feature_means.get(f, 5.0)) for f in top_14])
            y_pred = float(np.clip(top_14_intercept + np.dot(x_sub, top_14_coef), 0.01, 0.99))
            
            # Approximate CI & PI with RFE residual standard error
            # RMSE for top 14 is approx 0.0313
            se_pred = 0.0313
            se_mean = 0.0313 / np.sqrt(len(top_14))
            ci_low = float(np.clip(y_pred - t_crit * se_mean, 0.0, 1.0))
            ci_high = float(np.clip(y_pred + t_crit * se_mean, 0.0, 1.0))
            pi_low = float(np.clip(y_pred - t_crit * se_pred, 0.0, 1.0))
            pi_high = float(np.clip(y_pred + t_crit * se_pred, 0.0, 1.0))
            active_features = top_14
            active_coefs = top_14_coef.tolist()
        else:
            # Full 20 Feature OLS with Exact Mathematical Leverage & Interval
            y_pred = float(intercept + np.dot(x_vec, coefficients))
            
            # Design vector with constant 1.0 for intercept
            x_design = np.insert(x_vec, 0, 1.0)
            leverage = float(x_design @ XtX_inv @ x_design)
            
            se_mean = float(np.sqrt(residual_std**2 * leverage))
            se_pred = float(np.sqrt(residual_std**2 * (1.0 + leverage)))
            
            # Clamp raw linear output to valid probability domain [0.0, 1.0]
            y_pred = float(np.clip(y_pred, 0.01, 0.99))
            ci_low = float(np.clip(y_pred - t_crit * se_mean, 0.0, 1.0))
            ci_high = float(np.clip(y_pred + t_crit * se_mean, 0.0, 1.0))
            pi_low = float(np.clip(y_pred - t_crit * se_pred, 0.0, 1.0))
            pi_high = float(np.clip(y_pred + t_crit * se_pred, 0.0, 1.0))
            active_features = features
            active_coefs = coefficients.tolist()

        # Risk Classification
        if y_pred < 0.45:
            risk_level = "Low Risk (低風險)"
            risk_color = "#10b981" # Emerald Green
            risk_badge = "success"
            action_advice = "常態監測：流域水文與市政基礎設施處於良好警戒閾值內，維持例行巡檢。"
        elif y_pred < 0.53:
            risk_level = "Moderate Risk (中度風險)"
            risk_color = "#f59e0b" # Amber
            risk_badge = "warning"
            action_advice = "預防警戒：部分因子接近臨界值，建議加強清淤排澇、預備移動式抽水機組。"
        elif y_pred < 0.60:
            risk_level = "High Risk (高風險)"
            risk_color = "#ef4444" # Red
            risk_badge = "danger"
            action_advice = "高度戒備：多項關鍵脆弱指標超標，應啟動二級應變機制，預先布設沙包與防洪閘門。"
        else:
            risk_level = "Severe Flood Warning (極高/災難性洪澇警報)"
            risk_color = "#7f1d1d" # Deep Red / Maroon
            risk_badge = "critical"
            action_advice = "紅色暴洪警報：綜合脆弱性極高，啟動一級緊急避難疏散計畫並調度跨區抽水防洪工程！"

        # Feature Contributions (Waterfall/Attribution relative to mean baseline)
        contributions = []
        for feat, coef in zip(features, coefficients):
            val = float(inputs.get(feat, feature_means.get(feat, 5.0)))
            mean_val = feature_means.get(feat, 5.0)
            diff = val - mean_val
            contrib = float(coef * diff)
            contributions.append({
                'feature': feat,
                'value': val,
                'baseline_mean': round(mean_val, 2),
                'contribution': round(contrib, 5),
                'direction': 'increase' if contrib > 0 else 'decrease'
            })

        # Sort top positive risk drivers
        contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)

        return jsonify({
            'status': 'success',
            'prediction': {
                'flood_probability': round(y_pred, 4),
                'ci_95': [round(ci_low, 4), round(ci_high, 4)],
                'pi_95': [round(pi_low, 4), round(pi_high, 4)],
                'confidence_interval_width': round(ci_high - ci_low, 4),
                'prediction_interval_width': round(pi_high - pi_low, 4),
                'risk_level': risk_level,
                'risk_color': risk_color,
                'risk_badge': risk_badge,
                'action_advice': action_advice,
                'model_used': model_choice,
                'contributions': contributions
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/presets', methods=['GET'])
def get_presets():
    """Preset flood vulnerability scenarios for demonstration."""
    presets = {
        'baseline': {
            'name': '常態基準情境 (Regional Baseline)',
            'desc': '各項指標處於歷史平均值，整體防洪系統維持在穩態水準。',
            'values': {f: round(feature_means[f], 1) for f in features}
        },
        'typhoon_monsoon': {
            'name': '極端季風豪雨情境 (Severe Monsoon & Drainage Collapse)',
            'desc': '強降雨與季風強度激增，排水設施淤塞老化，防洪應變不及。',
            'values': {
                'MonsoonIntensity': 12, 'TopographyDrainage': 11, 'RiverManagement': 10,
                'Deforestation': 9, 'Urbanization': 11, 'ClimateChange': 11,
                'DamsQuality': 10, 'Siltation': 12, 'AgriculturalPractices': 8,
                'Encroachments': 11, 'IneffectiveDisasterPreparedness': 12, 'DrainageSystems': 12,
                'CoastalVulnerability': 11, 'Landslides': 10, 'Watersheds': 10,
                'DeterioratingInfrastructure': 12, 'PopulationScore': 11, 'WetlandLoss': 10,
                'InadequatePlanning': 11, 'PoliticalFactors': 9
            }
        },
        'resilient_eco_city': {
            'name': '韌性海綿生態城市 (Resilient Sponge Eco-City)',
            'desc': '完善的河川治理、高標準排洪設施、低侵占率與嚴密防災計畫。',
            'values': {
                'MonsoonIntensity': 2, 'TopographyDrainage': 2, 'RiverManagement': 2,
                'Deforestation': 1, 'Urbanization': 3, 'ClimateChange': 2,
                'DamsQuality': 1, 'Siltation': 2, 'AgriculturalPractices': 2,
                'Encroachments': 1, 'IneffectiveDisasterPreparedness': 1, 'DrainageSystems': 1,
                'CoastalVulnerability': 2, 'Landslides': 1, 'Watersheds': 2,
                'DeterioratingInfrastructure': 1, 'PopulationScore': 3, 'WetlandLoss': 1,
                'InadequatePlanning': 1, 'PoliticalFactors': 2
            }
        },
        'coastal_urban_crisis': {
            'name': '沿海都會侵蝕危機 (Coastal Urban Megacity Risk)',
            'desc': '人口密集度高、高度都市化且海岸脆弱度與基礎設施嚴重劣化。',
            'values': {
                'MonsoonIntensity': 8, 'TopographyDrainage': 9, 'RiverManagement': 8,
                'Deforestation': 7, 'Urbanization': 13, 'ClimateChange': 9,
                'DamsQuality': 8, 'Siltation': 8, 'AgriculturalPractices': 6,
                'Encroachments': 12, 'IneffectiveDisasterPreparedness': 9, 'DrainageSystems': 9,
                'CoastalVulnerability': 13, 'Landslides': 6, 'Watersheds': 7,
                'DeterioratingInfrastructure': 12, 'PopulationScore': 13, 'WetlandLoss': 11,
                'InadequatePlanning': 10, 'PoliticalFactors': 8
            }
        }
    }
    return jsonify({'status': 'success', 'data': presets})

if __name__ == '__main__':
    print("Starting Flood Risk Prediction Web App on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=False)
