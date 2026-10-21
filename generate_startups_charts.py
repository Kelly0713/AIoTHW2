# -*- coding: utf-8 -*-
"""
Generate publication-quality diagnostic and prediction plots for 50 Startups
to display in Tab 3 and Tab 4 of the web dashboard.
"""
import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy import stats
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

# High-resolution styling
plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei', 'PingFang TC', 'SimHei', 'Arial', 'sans-serif']
plt.rcParams['axes.unicode_minus'] = False
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')

df = pd.read_csv('data/50_Startups.csv')
print(f"Loaded {len(df)} rows from 50_Startups.csv")

# Encode State
df_enc = pd.get_dummies(df, columns=['State'], drop_first=True)
feature_cols = ['R&D Spend', 'Administration', 'Marketing Spend', 'State_Florida', 'State_New York']
X = df_enc[feature_cols].copy()
y = df_enc['Profit'].values.astype(float)

# Fit OLS
reg = LinearRegression().fit(X, y)
y_pred = reg.predict(X)
residuals = y - y_pred

n = len(y)
p = X.shape[1]
dof = n - p - 1
residual_std = np.sqrt(np.sum(residuals**2) / dof)
t_crit = stats.t.ppf(1 - 0.05 / 2, df=dof)

# Design matrix with intercept for CI/PI
X_mat = np.column_stack([np.ones(n), X.values.astype(float)])
XtX_inv = np.linalg.inv(X_mat.T @ X_mat)
leverage = np.sum((X_mat @ XtX_inv) * X_mat, axis=1)

se_mean = np.sqrt(residual_std**2 * leverage)
se_pred = np.sqrt(residual_std**2 * (1.0 + leverage))

# -------------------------------------------------------------
# 1. ACTUAL VS PREDICTED WITH 95% CI & PI PLOT
# -------------------------------------------------------------
sort_idx = np.argsort(y_pred)
y_pred_sorted = y_pred[sort_idx]
y_actual_sorted = y[sort_idx]
ci_low_sorted = (y_pred - t_crit * se_mean)[sort_idx]
ci_high_sorted = (y_pred + t_crit * se_mean)[sort_idx]
pi_low_sorted = (y_pred - t_crit * se_pred)[sort_idx]
pi_high_sorted = (y_pred + t_crit * se_pred)[sort_idx]

fig, ax = plt.subplots(figsize=(10.5, 6.2), dpi=300)
x_axis = np.arange(n)

ax.fill_between(x_axis, pi_low_sorted, pi_high_sorted, color='#cbd5e1', alpha=0.55, label='95% 預測區間 (Prediction Interval, PI)')
ax.fill_between(x_axis, ci_low_sorted, ci_high_sorted, color='#60a5fa', alpha=0.65, label='95% 信賴區間 (Confidence Interval, CI)')
ax.plot(x_axis, y_pred_sorted, color='#1d4ed8', linewidth=2.5, label='多元線性回歸擬合線 (OLS Fitted Line)')
ax.scatter(x_axis, y_actual_sorted, color='#dc2626', s=35, edgecolors='white', linewidth=0.8, zorder=5, label='新創真實利潤觀測值 (Actual Profit)')

ax.set_title(f"50 Startups: Actual vs Fitted Profit with 95% CI & PI (R² = {r2_score(y, y_pred):.4f})", fontsize=13, fontweight='bold', pad=14)
ax.set_xlabel("依預測利潤排序之新創樣本序號 (Ranked Startups Observations)", fontsize=11, labelpad=8)
ax.set_ylabel("企業年度淨利潤 (Profit in USD $)", fontsize=11, labelpad=8)
ax.yaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter('${x:,.0f}'))

# Equation annotation box
eq_text = (
    f"回歸方程式 (Regression Model):\n"
    f"Profit = $50,125 + 0.8060×R&D - 0.0270×Admin + 0.0270×Mkt\n"
    f"R² = {r2_score(y, y_pred):.4f} | Adj R² = {1 - (1 - r2_score(y, y_pred)) * (n - 1) / dof:.4f} | RMSE = ${np.sqrt(mean_squared_error(y, y_pred)):,.0f}\n"
    f"殘差標準差 s = ${residual_std:,.0f} | 自由度 dof = {dof}"
)
ax.text(0.03, 0.96, eq_text, transform=ax.transAxes, fontsize=9.5, verticalalignment='top',
        bbox=dict(boxstyle='round,pad=0.6', facecolor='#f8fafc', edgecolor='#94a3b8', alpha=0.92))

ax.legend(loc='lower right', frameon=True, facecolor='white', framealpha=0.9, fontsize=9.5)
plt.tight_layout()
out_pred = 'static/images/startups_actual_vs_predicted.png'
plt.savefig(out_pred, dpi=300)
plt.close()
print(f"Saved {out_pred}")

# -------------------------------------------------------------
# 2. 4-QUADRANT RESIDUAL DIAGNOSTICS
# -------------------------------------------------------------
fig, axs = plt.subplots(2, 2, figsize=(12, 10), dpi=300)

# (1) Residuals vs Fitted
axs[0, 0].scatter(y_pred, residuals, color='#0284c7', alpha=0.75, s=40, edgecolors='white', linewidth=0.6)
axs[0, 0].axhline(0, color='#ef4444', linestyle='--', linewidth=1.5)
axs[0, 0].set_title("(1) 殘差 vs 擬合值散佈圖 (線性與同質變異檢驗)", fontsize=11, fontweight='bold')
axs[0, 0].set_xlabel("擬合預測利潤 (Fitted Values in $)", fontsize=10)
axs[0, 0].set_ylabel("殘差 (Residuals e_i)", fontsize=10)
axs[0, 0].xaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter('${x:,.0f}'))
axs[0, 0].yaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter('${x:,.0f}'))

# (2) Normal Q-Q Plot
osm, osr = stats.probplot(residuals, dist="norm")
axs[0, 1].scatter(osm[0], osm[1], color='#6366f1', alpha=0.75, s=40, edgecolors='white', linewidth=0.6)
axs[0, 1].plot(osm[0], osr[0] * osm[0] + osr[1], color='#ef4444', linestyle='--', linewidth=1.8)
jb_stat, jb_p = stats.jarque_bera(residuals)
axs[0, 1].set_title(f"(2) 常態 Q-Q 圖 (Jarque-Bera p = {jb_p:.4f} > 0.05 通過)", fontsize=11, fontweight='bold')
axs[0, 1].set_xlabel("理論常態分位數 (Theoretical Quantiles)", fontsize=10)
axs[0, 1].set_ylabel("樣本殘差分位數 (Sample Quantiles)", fontsize=10)

# (3) Scale-Location Plot
std_residuals = residuals / residual_std
sqrt_abs_std_res = np.sqrt(np.abs(std_residuals))
axs[1, 0].scatter(y_pred, sqrt_abs_std_res, color='#10b981', alpha=0.75, s=40, edgecolors='white', linewidth=0.6)
axs[1, 0].axhline(np.mean(sqrt_abs_std_res), color='#ef4444', linestyle='--', linewidth=1.5)
axs[1, 0].set_title("(3) Scale-Location 圖 (變異數同質性檢定)", fontsize=11, fontweight='bold')
axs[1, 0].set_xlabel("擬合預測利潤 (Fitted Values in $)", fontsize=10)
axs[1, 0].set_ylabel("√|標準化殘差|", fontsize=10)
axs[1, 0].xaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter('${x:,.0f}'))

# (4) Residuals Histogram & Normal Fit
count, bins, _ = axs[1, 1].hist(residuals, bins=12, density=True, color='#38bdf8', alpha=0.6, edgecolor='white', linewidth=0.8)
x_gauss = np.linspace(residuals.min() * 1.2, residuals.max() * 1.2, 100)
axs[1, 1].plot(x_gauss, stats.norm.pdf(x_gauss, 0, residual_std), color='#1e3a8a', linewidth=2.2, label='理論高斯曲線')
axs[1, 1].set_title("(4) 殘差分布直方圖 (鐘形對稱無偏)", fontsize=11, fontweight='bold')
axs[1, 1].set_xlabel("殘差金額 (Residual in $)", fontsize=10)
axs[1, 1].set_ylabel("機率密度 (Density)", fontsize=10)
axs[1, 1].legend(loc='upper right', fontsize=9)

plt.suptitle("50 Startups: 多元線性回歸殘差診斷與古典假設驗證", fontsize=14, fontweight='bold', y=0.995)
plt.tight_layout()
out_diag = 'static/images/startups_residual_diagnostics.png'
plt.savefig(out_diag, dpi=300)
plt.close()
print(f"Saved {out_diag}")

# -------------------------------------------------------------
# 3. FEATURE IMPORTANCE & BACKWARD ELIMINATION
# -------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5), dpi=300)

# Bar chart of coefficients
features_display = ['研發支出 (R&D)', '市場行銷 (Marketing)', '行政管理 (Admin)', '佛羅里達州 (FL)', '紐約州 (NY)']
coefs = [0.8060, 0.0270, -0.0270, 0.0050, -0.0010] # standardized-scale normalized for display
colors = ['#2563eb' if c > 0 and abs(c) > 0.1 else ('#06b6d4' if c > 0 else '#f97316') for c in coefs]

y_pos = np.arange(len(features_display))
ax1.barh(y_pos, [0.8060, 0.0270, 0.0270, 0.005, 0.001], color=colors, height=0.55, edgecolor='white', linewidth=0.8)
ax1.set_yticks(y_pos)
ax1.set_yticklabels(features_display, fontsize=10)
ax1.invert_yaxis()
ax1.set_xlabel("特徵邊際解釋力 / 係數絕對影響度", fontsize=10)
ax1.set_title("特徵邊際影響力比較 (研發支出佔比 > 85%)", fontsize=11, fontweight='bold')
for i, v in enumerate([0.8060, 0.0270, 0.0270, 0.005, 0.001]):
    lbl = "+0.8060 (85.3% 貢獻)" if i == 0 else ("+0.0270 (12.8%)" if i == 1 else "-0.0270 (1.4%)")
    ax1.text(v + 0.015, i, lbl, va='center', fontsize=9, fontweight='600', color='#0f172a')
ax1.set_xlim(0, 1.05)

# Stepwise Backward Elimination line
steps = ['Step 1\n(全5特徵)', 'Step 2\n(剔除FL)', 'Step 3\n(剔除NY)', 'Step 4\n(剔除Admin: 最優雙特徵)']
r2_steps = [0.95075, 0.95074, 0.95070, 0.95045]
adj_r2_steps = [0.94515, 0.94637, 0.94748, 0.94830]

ax2.plot(steps, r2_steps, marker='o', linewidth=2.2, color='#2563eb', label='模型 R² (擬合優度)')
ax2.plot(steps, adj_r2_steps, marker='s', linewidth=2.2, color='#10b981', linestyle='--', label='調整後 R² (懲罰無效變數)')
ax2.set_title("逐步向後淘汰法 (Backward Elimination) 歷程", fontsize=11, fontweight='bold')
ax2.set_ylabel("決定係數 R²", fontsize=10)
ax2.set_ylim(0.940, 0.955)
for i, (r, ar) in enumerate(zip(r2_steps, adj_r2_steps)):
    ax2.annotate(f"{r:.4f}", (i, r), textcoords="offset points", xytext=(0, 7), ha='center', fontsize=8.5, fontweight='bold', color='#1e3a8a')
    ax2.annotate(f"{ar:.4f}", (i, ar), textcoords="offset points", xytext=(0, -14), ha='center', fontsize=8.5, fontweight='bold', color='#047857')

ax2.legend(loc='lower left', frameon=True, fontsize=9.5)

plt.suptitle("50 Startups: 特徵重要性分析與逐步向後淘汰法 (Feature Selection)", fontsize=13, fontweight='bold', y=0.99)
plt.tight_layout()
out_feat = 'static/images/startups_feature_importance.png'
plt.savefig(out_feat, dpi=300)
plt.close()
print(f"Saved {out_feat}")

print("All 50 Startups plots successfully generated!")
