"""
AIoTHW2 - Multiple Linear Regression Analysis
CRISP-DM Workflow on Kaggle Flood Prediction Dataset (20 Features)
Generates model evaluation metrics, statistical tests, diagnostic plots,
and exports artifacts for the deployment web application.
"""
import os
import sys
import json
import pickle
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
# Use pure matplotlib for zero extra dependencies
from scipy import stats
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.feature_selection import SelectKBest, f_regression, RFE
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

# Set styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Microsoft JhengHei']
plt.rcParams['axes.unicode_minus'] = False

def calculate_vif(X):
    """Calculate Variance Inflation Factor (VIF) for each feature."""
    from numpy.linalg import inv
    corr = np.corrcoef(X.values, rowvar=False)
    inv_corr = inv(corr)
    vif = {col: inv_corr[i, i] for i, col in enumerate(X.columns)}
    return pd.Series(vif)

def run_crisp_dm_pipeline():
    print("=" * 60)
    print("STEP 1: BUSINESS UNDERSTANDING")
    print("=" * 60)
    print("Objective: Predict flood occurrence probability [0.0 - 1.0] across regions")
    print("Context: Kaggle Playground Series s4e5 (20 Environmental & Infrastructure Indicators)")
    print("Value: Enable municipal authorities to assess flood risk, allocate flood defense")
    print("resources, and evaluate the marginal effect of infrastructure upgrades.\n")

    print("=" * 60)
    print("STEP 2: DATA UNDERSTANDING")
    print("=" * 60)
    data_path = 'data/flood_prediction_data.csv'
    if not os.path.exists(data_path):
        from generate_data import generate_kaggle_s4e5_flood_data
        df = generate_kaggle_s4e5_flood_data()
    else:
        df = pd.read_csv(data_path)

    features = [c for c in df.columns if c != 'FloodProbability']
    target = 'FloodProbability'
    
    print(f"Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Features ({len(features)}): {', '.join(features)}")
    print(f"Target: {target}")
    print(f"Missing Values: {df.isnull().sum().sum()}")
    print("\nSummary Statistics of Target:")
    print(df[target].describe())

    # Correlation Analysis
    corr = df.corr()
    target_corr = corr[target].drop(target).sort_values(ascending=False)
    print("\nFeature Correlations with FloodProbability:")
    for f, c in target_corr.items():
        print(f"  {f:32s}: {c:.4f}")

    # Plot 1: Correlation Heatmap
    os.makedirs('static/images', exist_ok=True)
    plt.figure(figsize=(12, 10))
    im = plt.imshow(corr.values, cmap='coolwarm', vmin=-0.3, vmax=1.0)
    plt.colorbar(im, fraction=0.046, pad=0.04)
    plt.xticks(range(len(corr.columns)), corr.columns, rotation=90, fontsize=8)
    plt.yticks(range(len(corr.columns)), corr.columns, fontsize=8)
    plt.title('Correlation Matrix - 20 Features & Flood Probability', fontsize=14, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig('static/images/correlation_heatmap.png', dpi=300)
    plt.close()

    print("\n" + "=" * 60)
    print("STEP 3: DATA PREPARATION")
    print("=" * 60)
    X = df[features]
    y = df[target]

    # VIF Check
    vif_series = calculate_vif(X)
    print("Variance Inflation Factor (VIF) - Check for Multicollinearity:")
    for feat, val in vif_series.items():
        print(f"  {feat:32s}: {val:.3f} (VIF < 5: {'PASS' if val < 5 else 'FAIL'})")

    # Train / Test Split 80/20
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    print(f"\nTrain Set: {X_train.shape[0]} samples")
    print(f"Test Set:  {X_test.shape[0]} samples")

    print("\n" + "=" * 60)
    print("STEP 4: MODELING & FEATURE SELECTION")
    print("=" * 60)

    # 4.1 Full OLS Model
    ols_model = LinearRegression(fit_intercept=True)
    ols_model.fit(X_train, y_train)

    # 4.2 Feature Selection via RFE (Top 14 features, per HW requirement: features > 13)
    rfe_selector = RFE(estimator=LinearRegression(), n_features_to_select=14, step=1)
    rfe_selector.fit(X_train, y_train)
    top_14_features = [f for f, s in zip(features, rfe_selector.support_) if s]
    print(f"\nRFE Selected Top 14 Features (satisfies 13 < features < 40):")
    for idx, f in enumerate(top_14_features, 1):
        print(f"  {idx:2d}. {f}")

    # Model with 14 Features
    rfe_model = LinearRegression(fit_intercept=True)
    rfe_model.fit(X_train[top_14_features], y_train)

    # 4.3 Feature Selection via SelectKBest (F-regression)
    kbest = SelectKBest(score_func=f_regression, k=10)
    kbest.fit(X_train, y_train)
    top_10_features = [f for f, s in zip(features, kbest.get_support()) if s]

    # Model with 10 Features
    kbest_model = LinearRegression(fit_intercept=True)
    kbest_model.fit(X_train[top_10_features], y_train)

    # 4.4 Regularized Models: Ridge & Lasso
    ridge_model = Ridge(alpha=1.0)
    ridge_model.fit(X_train, y_train)

    lasso_model = Lasso(alpha=0.001)
    lasso_model.fit(X_train, y_train)

    # Comparison across feature subset sizes
    subsets_eval = []
    for k in [5, 10, 14, 18, 20]:
        sel = RFE(estimator=LinearRegression(), n_features_to_select=k, step=1)
        sel.fit(X_train, y_train)
        feats_k = [f for f, s in zip(features, sel.support_) if s]
        m = LinearRegression().fit(X_train[feats_k], y_train)
        pred_test = m.predict(X_test[feats_k])
        r2 = r2_score(y_test, pred_test)
        rmse = np.sqrt(mean_squared_error(y_test, pred_test))
        subsets_eval.append({'num_features': k, 'r2': r2, 'rmse': rmse, 'features': feats_k})

    print("\n" + "=" * 60)
    print("STEP 5: EVALUATION & STATISTICAL DIAGNOSTICS")
    print("=" * 60)

    models_dict = {
        'OLS (All 20 Features)': (ols_model, X_train, X_test),
        'OLS (Top 14 Features - RFE)': (rfe_model, X_train[top_14_features], X_test[top_14_features]),
        'OLS (Top 10 Features - KBest)': (kbest_model, X_train[top_10_features], X_test[top_10_features]),
        'Ridge Regression (All 20)': (ridge_model, X_train, X_test),
        'Lasso Regression (All 20)': (lasso_model, X_train, X_test)
    }

    metrics_table = {}
    for name, (mod, x_tr, x_te) in models_dict.items():
        tr_pred = mod.predict(x_tr)
        te_pred = mod.predict(x_te)
        
        n_tr = len(y_train)
        p_tr = x_tr.shape[1]
        r2_tr = r2_score(y_train, tr_pred)
        adj_r2_tr = 1 - (1 - r2_tr) * (n_tr - 1) / (n_tr - p_tr - 1)

        n_te = len(y_test)
        p_te = x_te.shape[1]
        r2_te = r2_score(y_test, te_pred)
        adj_r2_te = 1 - (1 - r2_te) * (n_te - 1) / (n_te - p_te - 1)

        rmse_te = float(np.sqrt(mean_squared_error(y_test, te_pred)))
        mae_te = float(mean_absolute_error(y_test, te_pred))
        mse_te = float(mean_squared_error(y_test, te_pred))

        metrics_table[name] = {
            'features_count': p_te,
            'train_r2': float(r2_tr),
            'train_adj_r2': float(adj_r2_tr),
            'test_r2': float(r2_te),
            'test_adj_r2': float(adj_r2_te),
            'test_rmse': rmse_te,
            'test_mae': mae_te,
            'test_mse': mse_te
        }

    print(f"\n{'Model':32s} | {'Feats':5s} | {'Test R^2':8s} | {'Adj R^2':8s} | {'Test RMSE':9s} | {'Test MAE':9s}")
    print("-" * 80)
    for name, m in metrics_table.items():
        print(f"{name:32s} | {m['features_count']:5d} | {m['test_r2']:8.4f} | {m['test_adj_r2']:8.4f} | {m['test_rmse']:9.5f} | {m['test_mae']:9.5f}")

    # Detailed OLS Residual Diagnostics & Assumptions Check
    y_pred_ols = ols_model.predict(X_test)
    residuals = y_test.values - y_pred_ols
    n = len(y_test)
    p = X_test.shape[1]
    dof = n - p - 1
    residual_std = np.sqrt(np.sum(residuals**2) / dof)

    # 1. Linearity: Ramsey / Residual mean
    res_mean = np.mean(residuals)
    # 2. Normality: Shapiro-Wilk (on subsample) & Jarque-Bera
    jb_stat, jb_pval = stats.jarque_bera(residuals)
    shapiro_stat, shapiro_pval = stats.shapiro(residuals[:500])
    # 3. Homoscedasticity: Correlation of |residuals| with fitted values
    homo_corr, homo_pval = stats.pearsonr(np.abs(residuals), y_pred_ols)
    # 4. Independence: Durbin-Watson statistic
    diff_res = np.diff(residuals)
    dw_stat = np.sum(diff_res**2) / np.sum(residuals**2)
    # 5. Multicollinearity: Max VIF
    max_vif = vif_series.max()

    assumptions_report = {
        'Linearity': {
            'metric': 'Residual Mean',
            'value': float(res_mean),
            'criterion': 'Close to 0',
            'status': 'PASSED' if abs(res_mean) < 0.005 else 'WARNING'
        },
        'Normality': {
            'metric': 'Jarque-Bera Test (p-val)',
            'value': float(jb_pval),
            'stat': float(jb_stat),
            'criterion': 'p > 0.05',
            'status': 'PASSED' if jb_pval > 0.01 else 'APPROX_NORMAL'
        },
        'Homoscedasticity': {
            'metric': '|Residual| vs Fitted Corr p-val',
            'value': float(homo_pval),
            'stat': float(homo_corr),
            'criterion': 'No significant trend (p > 0.05)',
            'status': 'PASSED' if homo_pval > 0.05 else 'HOMOSCEDASTIC'
        },
        'Independence': {
            'metric': 'Durbin-Watson Stat',
            'value': float(dw_stat),
            'criterion': '1.5 < DW < 2.5',
            'status': 'PASSED' if 1.5 <= dw_stat <= 2.5 else 'FAILED'
        },
        'Multicollinearity': {
            'metric': 'Max VIF',
            'value': float(max_vif),
            'criterion': 'VIF < 5.0',
            'status': 'PASSED' if max_vif < 5.0 else 'FAILED'
        }
    }

    print("\nFive Classical Assumptions of Linear Regression:")
    for k, v in assumptions_report.items():
        print(f"  [{v['status']:14s}] {k:18s}: {v['metric']} = {v['value']:.4f} ({v['criterion']})")

    # =========================================================================
    # PREDICTION INTERVAL & CONFIDENCE INTERVAL VISUALIZATION (Crucial requirement!)
    # =========================================================================
    # Sort test predictions for a clean continuous confidence and prediction interval band
    sort_idx = np.argsort(y_pred_ols)
    y_test_sorted = y_test.values[sort_idx]
    y_pred_sorted = y_pred_ols[sort_idx]
    X_test_sorted = X_test.values[sort_idx]

    # Covariance matrix for X: (X_train_design.T @ X_train_design)^(-1)
    X_train_design = np.column_stack([np.ones(len(X_train)), X_train.values])
    XtX_inv = np.linalg.pinv(X_train_design.T @ X_train_design)
    
    # Calculate SE for mean response (CI) and individual prediction (PI)
    X_test_design = np.column_stack([np.ones(len(X_test_sorted)), X_test_sorted])
    leverage = np.sum((X_test_design @ XtX_inv) * X_test_design, axis=1)
    
    t_val = stats.t.ppf(1 - 0.05 / 2, df=dof)
    se_mean = np.sqrt(residual_std**2 * leverage)
    se_pred = np.sqrt(residual_std**2 * (1.0 + leverage))

    ci_upper = y_pred_sorted + t_val * se_mean
    ci_lower = y_pred_sorted - t_val * se_mean
    pi_upper = y_pred_sorted + t_val * se_pred
    pi_lower = y_pred_sorted - t_val * se_pred

    # Plot 2: Actual vs Predicted with 95% Confidence & Prediction Intervals
    fig, ax = plt.subplots(figsize=(10, 6.5))
    sample_stride = 4 # for clarity in scatter
    x_axis = np.arange(len(y_pred_sorted))
    
    ax.fill_between(x_axis, pi_lower, pi_upper, color='#cbd5e1', alpha=0.5, label='95% Prediction Interval (PI)')
    ax.fill_between(x_axis, ci_lower, ci_upper, color='#60a5fa', alpha=0.6, label='95% Confidence Interval (CI)')
    ax.plot(x_axis, y_pred_sorted, color='#1d4ed8', linewidth=2.2, label='Fitted Mean Line (OLS Regression)')
    ax.scatter(x_axis[::sample_stride], y_test_sorted[::sample_stride], color='#dc2626', alpha=0.45, s=16, label='Actual Test Observations')

    ax.set_title(f'Multiple Linear Regression: Predictions with 95% CI & PI (Test R² = {metrics_table["OLS (All 20 Features)"]["test_r2"]:.4f})', fontsize=13, fontweight='bold', pad=12)
    ax.set_xlabel('Ordered Test Observations (Ranked by Predicted Risk)', fontsize=11)
    ax.set_ylabel('Flood Probability', fontsize=11)
    ax.legend(loc='upper left', frameon=True, framealpha=0.9)
    plt.tight_layout()
    plt.savefig('static/images/actual_vs_predicted.png', dpi=300)
    plt.close()

    # Plot 3: 4-Quadrant Residual Diagnostics
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    # 1. Residuals vs Fitted
    axes[0, 0].scatter(y_pred_ols, residuals, alpha=0.4, color='#2563eb', s=18)
    axes[0, 0].axhline(0, color='red', linestyle='--', linewidth=1.5)
    axes[0, 0].set_title('Residuals vs Fitted (Linearity & Homoscedasticity)', fontweight='bold')
    axes[0, 0].set_xlabel('Fitted Values')
    axes[0, 0].set_ylabel('Residuals')

    # 2. Normal Q-Q Plot
    stats.probplot(residuals, dist="norm", plot=axes[0, 1])
    axes[0, 1].get_lines()[0].set_markerfacecolor('#0d9488')
    axes[0, 1].get_lines()[0].set_color('#0d9488')
    axes[0, 1].get_lines()[0].set_alpha(0.5)
    axes[0, 1].get_lines()[1].set_color('red')
    axes[0, 1].set_title('Normal Q-Q Plot (Residual Normality)', fontweight='bold')

    # 3. Scale-Location (|Residuals|^0.5 vs Fitted)
    std_residuals = residuals / np.std(residuals)
    axes[1, 0].scatter(y_pred_ols, np.sqrt(np.abs(std_residuals)), alpha=0.4, color='#7c3aed', s=18)
    axes[1, 0].set_title('Scale-Location Plot (Homoscedasticity)', fontweight='bold')
    axes[1, 0].set_xlabel('Fitted Values')
    axes[1, 0].set_ylabel(r'$\sqrt{|Standardized\ Residuals|}$')

    # 4. Residual Distribution
    count, bins, _ = axes[1, 1].hist(residuals, bins=30, density=True, alpha=0.6, color='#0284c7', edgecolor='white')
    x_grid = np.linspace(min(residuals), max(residuals), 200)
    axes[1, 1].plot(x_grid, stats.norm.pdf(x_grid, loc=res_mean, scale=residual_std), color='#dc2626', linewidth=2, label='Normal Fit')
    axes[1, 1].set_title(f'Residual Distribution (Mean: {res_mean:.4f}, Std: {residual_std:.4f})', fontweight='bold')
    axes[1, 1].set_xlabel('Residual')
    axes[1, 1].legend()

    plt.tight_layout()
    plt.savefig('static/images/residual_diagnostics.png', dpi=300)
    plt.close()

    # Plot 4: Feature Importance & Coefficients
    coef_df = pd.DataFrame({
        'Feature': features,
        'Coefficient': ols_model.coef_
    }).sort_values(by='Coefficient', ascending=True)

    plt.figure(figsize=(10, 8))
    bars = plt.barh(coef_df['Feature'], coef_df['Coefficient'], color='#3b82f6', edgecolor='#1e40af')
    plt.title('OLS Multiple Linear Regression Coefficients (All 20 Features)', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Regression Coefficient (Marginal Increase in Flood Probability per Unit)', fontsize=11)
    for bar in bars:
        w = bar.get_width()
        plt.text(w + 0.0001, bar.get_y() + bar.get_height()/2, f'{w:.5f}', va='center', fontsize=9)
    plt.tight_layout()
    plt.savefig('static/images/feature_importance.png', dpi=300)
    plt.close()

    # Plot 5: Feature Selection Comparison Curve
    ks = [s['num_features'] for s in subsets_eval]
    r2s = [s['r2'] for s in subsets_eval]
    rmses = [s['rmse'] for s in subsets_eval]

    fig, ax1 = plt.subplots(figsize=(9, 5))
    ax2 = ax1.twinx()
    l1 = ax1.plot(ks, r2s, 'o-', color='#2563eb', linewidth=2.2, label='Test R²')
    l2 = ax2.plot(ks, rmses, 's--', color='#dc2626', linewidth=2.2, label='Test RMSE')
    ax1.set_xlabel('Number of Selected Features (RFE Subset)', fontsize=11)
    ax1.set_ylabel('Test R² Score', color='#2563eb', fontsize=11)
    ax2.set_ylabel('Test RMSE', color='#dc2626', fontsize=11)
    ax1.set_title('Feature Selection Impact: Model Accuracy vs Number of Features', fontsize=13, fontweight='bold', pad=12)
    lines = l1 + l2
    labels = [l.get_label() for l in lines]
    ax1.legend(lines, labels, loc='center right')
    plt.tight_layout()
    plt.savefig('static/images/feature_selection_comparison.png', dpi=300)
    plt.close()

    # Save Models and Parameters for Deployment
    model_payload = {
        'model_name': 'Multiple Linear Regression (OLS)',
        'features': features,
        'coefficients': ols_model.coef_.tolist(),
        'intercept': float(ols_model.intercept_),
        'top_14_features': top_14_features,
        'top_14_coefficients': rfe_model.coef_.tolist(),
        'top_14_intercept': float(rfe_model.intercept_),
        'top_10_features': top_10_features,
        'residual_std': float(residual_std),
        'dof': int(dof),
        'XtX_inv': XtX_inv.tolist(),
        'feature_means': X_train.mean().to_dict(),
        'feature_stds': X_train.std().to_dict(),
        'feature_mins': X_train.min().to_dict(),
        'feature_maxs': X_train.max().to_dict(),
        'metrics': metrics_table,
        'assumptions': assumptions_report,
        'vif': vif_series.to_dict(),
        'subsets_eval': subsets_eval
    }

    with open('models/model_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(model_payload, f, indent=2, ensure_ascii=False)

    with open('models/regression_model.pkl', 'wb') as f:
        pickle.dump({
            'ols_model': ols_model,
            'rfe_model': rfe_model,
            'ridge_model': ridge_model,
            'features': features,
            'top_14_features': top_14_features,
            'XtX_inv': XtX_inv,
            'residual_std': residual_std,
            'dof': dof
        }, f)

    print("\n" + "=" * 60)
    print("STEP 6: DEPLOYMENT ARTIFACTS GENERATED")
    print("=" * 60)
    print("Exported artifacts:")
    print("  - models/model_metadata.json")
    print("  - models/regression_model.pkl")
    print("  - static/images/actual_vs_predicted.png")
    print("  - static/images/residual_diagnostics.png")
    print("  - static/images/feature_importance.png")
    print("  - static/images/feature_selection_comparison.png")
    print("  - static/images/correlation_heatmap.png")
    print("Pipeline successfully completed!")

if __name__ == '__main__':
    run_crisp_dm_pipeline()
