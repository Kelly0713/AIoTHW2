/**
 * HydroPredict AI - Interactive Web Application Logic
 * Supports BOTH Local Flask Server (http://127.0.0.1:5000)
 * AND Static GitHub Pages Deployment (https://<username>.github.io/<repo>/)
 */

// Hydrologic and Municipal Feature Categorization
const FEATURE_CLUSTERS = {
    hydrology: [
        { id: 'MonsoonIntensity', name: '季風降雨強度 (Monsoon Intensity)', min: 0, max: 16, def: 5 },
        { id: 'TopographyDrainage', name: '地形排水能力 (Topography Drainage)', min: 0, max: 16, def: 5 },
        { id: 'RiverManagement', name: '河道水系整治 (River Management)', min: 0, max: 16, def: 5 },
        { id: 'DamsQuality', name: '水庫大壩耐洪品質 (Dams Quality)', min: 0, max: 16, def: 5 },
        { id: 'Watersheds', name: '集水區蓄水狀態 (Watersheds)', min: 0, max: 16, def: 5 }
    ],
    environment: [
        { id: 'Deforestation', name: '上游森林濫伐 (Deforestation)', min: 0, max: 16, def: 5 },
        { id: 'ClimateChange', name: '氣候變遷加劇指數 (Climate Change)', min: 0, max: 16, def: 5 },
        { id: 'Siltation', name: '河道淤積程度 (Siltation)', min: 0, max: 16, def: 5 },
        { id: 'AgriculturalPractices', name: '農業開墾水保不良 (Agricultural Practices)', min: 0, max: 16, def: 5 },
        { id: 'WetlandLoss', name: '天然濕地滯洪流失 (Wetland Loss)', min: 0, max: 16, def: 5 },
        { id: 'Landslides', name: '土石流與邊坡滑動 (Landslides)', min: 0, max: 16, def: 5 }
    ],
    urban: [
        { id: 'Urbanization', name: '都市化不透水率 (Urbanization)', min: 0, max: 16, def: 5 },
        { id: 'DrainageSystems', name: '雨水下水道管網效能 (Drainage Systems)', min: 0, max: 16, def: 5 },
        { id: 'DeterioratingInfrastructure', name: '防洪基建老化度 (Deteriorating Infrastructure)', min: 0, max: 16, def: 5 },
        { id: 'PopulationScore', name: '洪泛區人口密度 (Population Score)', min: 0, max: 16, def: 5 },
        { id: 'CoastalVulnerability', name: '海岸線侵蝕脆弱度 (Coastal Vulnerability)', min: 0, max: 16, def: 5 }
    ],
    governance: [
        { id: 'Encroachments', name: '河道行水區違建侵占 (Encroachments)', min: 0, max: 16, def: 5 },
        { id: 'IneffectiveDisasterPreparedness', name: '防災整備與救災弱化 (Ineffective Preparedness)', min: 0, max: 16, def: 5 },
        { id: 'InadequatePlanning', name: '國土規劃缺失防洪 (Inadequate Planning)', min: 0, max: 16, def: 5 },
        { id: 'PoliticalFactors', name: '防汛決策治理延宕 (Political Factors)', min: 0, max: 16, def: 5 }
    ]
};

// Built-in presets for offline / GitHub Pages static mode
const STATIC_PRESETS = {
    baseline: {
        name: '常態基準流域 (Regional Baseline)',
        desc: '各項指標處於歷史平均值，整體防洪系統維持在穩態水準。',
        values: {
            MonsoonIntensity: 5, TopographyDrainage: 5, RiverManagement: 5, Deforestation: 5,
            Urbanization: 5, ClimateChange: 5, DamsQuality: 5, Siltation: 5, AgriculturalPractices: 5,
            Encroachments: 5, IneffectiveDisasterPreparedness: 5, DrainageSystems: 5, CoastalVulnerability: 5,
            Landslides: 5, Watersheds: 5, DeterioratingInfrastructure: 5, PopulationScore: 5,
            WetlandLoss: 5, InadequatePlanning: 5, PoliticalFactors: 5
        }
    },
    typhoon_monsoon: {
        name: '極端季風豪雨情境 (Severe Monsoon & Drainage Collapse)',
        desc: '強降雨與季風強度激增，排水設施淤塞老化，防洪應變不及。',
        values: {
            MonsoonIntensity: 12, TopographyDrainage: 11, RiverManagement: 10,
            Deforestation: 9, Urbanization: 11, ClimateChange: 11,
            DamsQuality: 10, Siltation: 12, AgriculturalPractices: 8,
            Encroachments: 11, IneffectiveDisasterPreparedness: 12, DrainageSystems: 12,
            CoastalVulnerability: 11, Landslides: 10, Watersheds: 10,
            DeterioratingInfrastructure: 12, PopulationScore: 11, WetlandLoss: 10,
            InadequatePlanning: 11, PoliticalFactors: 9
        }
    },
    resilient_eco_city: {
        name: '韌性海綿生態城市 (Resilient Sponge Eco-City)',
        desc: '完善的河川治理、高標準排洪設施、低侵占率與嚴密防災計畫。',
        values: {
            MonsoonIntensity: 2, TopographyDrainage: 2, RiverManagement: 2,
            Deforestation: 1, Urbanization: 3, ClimateChange: 2,
            DamsQuality: 1, Siltation: 2, AgriculturalPractices: 2,
            Encroachments: 1, IneffectiveDisasterPreparedness: 1, DrainageSystems: 1,
            CoastalVulnerability: 2, Landslides: 1, Watersheds: 2,
            DeterioratingInfrastructure: 1, PopulationScore: 3, WetlandLoss: 1,
            InadequatePlanning: 1, PoliticalFactors: 2
        }
    },
    coastal_urban_crisis: {
        name: '沿海都會侵蝕危機 (Coastal Urban Megacity Risk)',
        desc: '人口密集度高、高度都市化且海岸脆弱度與基礎設施嚴重劣化。',
        values: {
            MonsoonIntensity: 8, TopographyDrainage: 9, RiverManagement: 8,
            Deforestation: 7, Urbanization: 13, ClimateChange: 9,
            DamsQuality: 8, Siltation: 8, AgriculturalPractices: 6,
            Encroachments: 12, IneffectiveDisasterPreparedness: 9, DrainageSystems: 9,
            CoastalVulnerability: 13, Landslides: 6, Watersheds: 7,
            DeterioratingInfrastructure: 12, PopulationScore: 13, WetlandLoss: 11,
            InadequatePlanning: 10, PoliticalFactors: 8
        }
    }
};

let currentFeatureValues = {};
let presetsData = STATIC_PRESETS;
let debounceTimer = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initSliders();
    initStartupsControls();
    initProblemSelector();
    tryFetchServerPresets();
    setupListeners();
    triggerPrediction();
    updateStartupsPrediction();
});

// Tab Switching
function switchTab(tabId) {
    const tabBtns = document.querySelectorAll('.nav-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    const activeBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    const activePane = document.getElementById(tabId);
    if (activeBtn) activeBtn.classList.add('active');
    if (activePane) activePane.classList.add('active');
}
window.switchTab = switchTab;

function initTabs() {
    const tabBtns = document.querySelectorAll('.nav-tab');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            switchTab(targetId);
        });
    });
}

// Sliders Initialization
function initSliders() {
    for (const [clusterKey, featureList] of Object.entries(FEATURE_CLUSTERS)) {
        const container = document.getElementById(`cluster-${clusterKey}`);
        if (!container) continue;

        featureList.forEach(feat => {
            currentFeatureValues[feat.id] = feat.def;

            const group = document.createElement('div');
            group.className = 'slider-group';
            group.innerHTML = `
                <div class="slider-label-row">
                    <span class="slider-name" title="${feat.name}">${feat.name}</span>
                    <span class="slider-val" id="val-${feat.id}">${feat.def}</span>
                </div>
                <input type="range" class="styled-range" 
                       id="range-${feat.id}" 
                       data-feat="${feat.id}" 
                       min="${feat.min}" 
                       max="${feat.max}" 
                       step="1" 
                       value="${feat.def}">
            `;
            container.appendChild(group);

            const rangeInput = group.querySelector('input');
            rangeInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                currentFeatureValues[feat.id] = val;
                document.getElementById(`val-${feat.id}`).innerText = val;
                
                // Clear active preset button state
                document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
                
                debouncedPredict();
            });
        });
    }
}

// Try Fetch Presets from Server if available
async function tryFetchServerPresets() {
    try {
        const res = await fetch('/api/presets');
        if (res.ok) {
            const data = await res.json();
            if (data.status === 'success') {
                presetsData = data.data;
            }
        }
    } catch (err) {
        // Fallback to static presets seamlessly
        presetsData = STATIC_PRESETS;
    }
}

// Setup Event Listeners
function setupListeners() {
    // Presets
    document.querySelectorAll('.btn-preset[data-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetKey = btn.getAttribute('data-preset');
            applyPreset(presetKey);
            document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Reset button
    const resetBtn = document.getElementById('btnResetValues');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            applyPreset('baseline');
            document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
            document.querySelector('.btn-preset[data-preset="baseline"]')?.classList.add('active');
        });
    }

    // Model select change
    const modelSelect = document.getElementById('modelChoiceSelect');
    if (modelSelect) {
        modelSelect.addEventListener('change', () => {
            triggerPrediction();
        });
    }
}

// Apply Preset Values
function applyPreset(presetKey) {
    if (!presetsData[presetKey]) return;
    const vals = presetsData[presetKey].values;

    for (const [feat, val] of Object.entries(vals)) {
        currentFeatureValues[feat] = val;
        const input = document.getElementById(`range-${feat}`);
        const label = document.getElementById(`val-${feat}`);
        if (input) input.value = val;
        if (label) label.innerText = val;
    }

    triggerPrediction();
}

function debouncedPredict() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        triggerPrediction();
    }, 30);
}

// Trigger Prediction Call (Dual-mode: Instant Client-Side Math OR API)
async function triggerPrediction() {
    const modelChoice = document.getElementById('modelChoiceSelect')?.value || 'full_ols';

    // 1. Try Instant Client-Side Computation (0ms latency, works on GitHub Pages & offline)
    if (typeof MODEL_METADATA !== 'undefined') {
        const localPred = predictClientSide(currentFeatureValues, modelChoice);
        if (localPred) {
            updateDashboard(localPred);
            return;
        }
    }

    // 2. Fallback to Flask API if running on server
    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model_choice: modelChoice,
                features: currentFeatureValues
            })
        });

        const resData = await response.json();
        if (resData.status === 'success') {
            updateDashboard(resData.prediction);
        }
    } catch (err) {
        console.error('Prediction API call failed:', err);
    }
}

// Pure Client-Side Inference Engine (Identical Math to Python OLS & Matrix Leverage)
function predictClientSide(inputs, modelChoice) {
    const meta = MODEL_METADATA;
    if (!meta) return null;

    const features = meta.features;
    const means = meta.feature_means;
    const t_crit = 1.96055;

    let y_pred = 0;
    let ci_low = 0, ci_high = 0, pi_low = 0, pi_high = 0;
    let se_mean = 0, se_pred = 0;

    if (modelChoice === 'top_14_rfe') {
        const top_14 = meta.top_14_features;
        const top_14_coef = meta.top_14_coefficients;
        const top_14_intercept = meta.top_14_intercept;

        let sum = top_14_intercept;
        for (let i = 0; i < top_14.length; i++) {
            const f = top_14[i];
            const val = Number(inputs[f] !== undefined ? inputs[f] : (means[f] || 5.0));
            sum += val * top_14_coef[i];
        }
        y_pred = Math.max(0.01, Math.min(0.99, sum));
        se_pred = 0.0313;
        se_mean = 0.0313 / Math.sqrt(top_14.length);
        ci_low = Math.max(0.0, y_pred - t_crit * se_mean);
        ci_high = Math.min(1.0, y_pred + t_crit * se_mean);
        pi_low = Math.max(0.0, y_pred - t_crit * se_pred);
        pi_high = Math.min(1.0, y_pred + t_crit * se_pred);
    } else {
        const coefs = meta.coefficients;
        const intercept = meta.intercept;
        const XtX_inv = meta.XtX_inv;
        const s = meta.residual_std;

        const x_vec = [];
        let sum = intercept;
        for (let i = 0; i < features.length; i++) {
            const f = features[i];
            const val = Number(inputs[f] !== undefined ? inputs[f] : (means[f] || 5.0));
            x_vec.push(val);
            sum += val * coefs[i];
        }
        y_pred = Math.max(0.01, Math.min(0.99, sum));

        // Design vector [1.0, x1, x2, ...]
        const x_design = [1.0, ...x_vec];
        let leverage = 0.0;
        const p = x_design.length;
        for (let r = 0; r < p; r++) {
            let row_dot = 0.0;
            const row = XtX_inv[r];
            for (let c = 0; c < p; c++) {
                row_dot += row[c] * x_design[c];
            }
            leverage += x_design[r] * row_dot;
        }

        se_mean = Math.sqrt(s * s * Math.max(0, leverage));
        se_pred = Math.sqrt(s * s * (1.0 + Math.max(0, leverage)));

        ci_low = Math.max(0.0, y_pred - t_crit * se_mean);
        ci_high = Math.min(1.0, y_pred + t_crit * se_mean);
        pi_low = Math.max(0.0, y_pred - t_crit * se_pred);
        pi_high = Math.min(1.0, y_pred + t_crit * se_pred);
    }

    // Risk Classification
    let risk_level = "", risk_color = "", risk_badge = "", action_advice = "";
    if (y_pred < 0.45) {
        risk_level = "Low Risk (低風險)";
        risk_color = "#10b981";
        risk_badge = "low";
        action_advice = "常態監測：流域水文與市政基礎設施處於良好警戒閾值內，維持例行巡檢。";
    } else if (y_pred < 0.53) {
        risk_level = "Moderate Risk (中度風險)";
        risk_color = "#f59e0b";
        risk_badge = "moderate";
        action_advice = "預防警戒：部分因子接近臨界值，建議加強清淤排澇、預備移動式抽水機組。";
    } else if (y_pred < 0.60) {
        risk_level = "High Risk (高風險)";
        risk_color = "#ef4444";
        risk_badge = "high";
        action_advice = "高度戒備：多項關鍵脆弱指標超標，應啟動二級應變機制，預先布設沙包與防洪閘門。";
    } else {
        risk_level = "Severe Flood Warning (極高/災難性洪澇警報)";
        risk_color = "#7f1d1d";
        risk_badge = "critical";
        action_advice = "紅色暴洪警報：綜合脆弱性極高，啟動一級緊急避難疏散計畫並調度跨區抽水防洪工程！";
    }

    // Feature Waterfall Attribution
    const contributions = [];
    const coefs = meta.coefficients;
    for (let i = 0; i < features.length; i++) {
        const feat = features[i];
        const val = Number(inputs[feat] !== undefined ? inputs[feat] : (means[feat] || 5.0));
        const mean_val = means[feat] || 5.0;
        const contrib = coefs[i] * (val - mean_val);
        contributions.push({
            feature: feat,
            value: val,
            baseline_mean: Number(mean_val.toFixed(2)),
            contribution: contrib,
            direction: contrib >= 0 ? 'increase' : 'decrease'
        });
    }
    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return {
        flood_probability: y_pred,
        ci_95: [ci_low, ci_high],
        pi_95: [pi_low, pi_high],
        confidence_interval_width: ci_high - ci_low,
        prediction_interval_width: pi_high - pi_low,
        risk_level: risk_level,
        risk_color: risk_color,
        risk_badge: risk_badge,
        action_advice: action_advice,
        model_used: modelChoice,
        contributions: contributions
    };
}

// Update UI Dashboard with Results
function updateDashboard(pred) {
    const prob = pred.flood_probability;
    const ci = pred.ci_95;
    const pi = pred.pi_95;

    // 1. Big Number
    const probElem = document.getElementById('predProbValue');
    if (probElem) probElem.innerText = prob.toFixed(4);

    // 2. Main Probability Bar
    const fillElem = document.getElementById('predProbFill');
    if (fillElem) fillElem.style.width = `${Math.min(100, Math.max(0, prob * 100))}%`;

    // 3. Risk Badge
    const badge = document.getElementById('riskBadge');
    if (badge) {
        badge.className = `badge-risk badge-${pred.risk_badge}`;
        badge.innerText = pred.risk_level;
        badge.style.color = pred.risk_color;
    }

    // 4. CI Box
    const ciElem = document.getElementById('ciValue');
    const ciWidthElem = document.getElementById('ciWidth');
    if (ciElem) ciElem.innerText = `[${ci[0].toFixed(4)}, ${ci[1].toFixed(4)}]`;
    if (ciWidthElem) ciWidthElem.innerText = `信賴區間半寬: ±${((ci[1] - ci[0])/2).toFixed(4)}`;

    // 5. PI Box
    const piElem = document.getElementById('piValue');
    const piWidthElem = document.getElementById('piWidth');
    if (piElem) piElem.innerText = `[${pi[0].toFixed(4)}, ${pi[1].toFixed(4)}]`;
    if (piWidthElem) piWidthElem.innerText = `預測區間半寬: ±${((pi[1] - pi[0])/2).toFixed(4)}`;

    // 6. Visual Track
    const ivPiBand = document.getElementById('ivPiBand');
    const ivCiBand = document.getElementById('ivCiBand');
    const ivPointer = document.getElementById('ivPointer');

    if (ivPiBand && ivCiBand && ivPointer) {
        const piLeft = Math.max(0, pi[0] * 100);
        const piWidth = Math.min(100 - piLeft, (pi[1] - pi[0]) * 100);
        ivPiBand.style.left = `${piLeft}%`;
        ivPiBand.style.width = `${piWidth}%`;

        const ciLeft = Math.max(0, ci[0] * 100);
        const ciWidth = Math.min(100 - ciLeft, (ci[1] - ci[0]) * 100);
        ivCiBand.style.left = `${ciLeft}%`;
        ivCiBand.style.width = `${Math.max(1.2, ciWidth)}%`;

        ivPointer.style.left = `${Math.min(100, Math.max(0, prob * 100))}%`;
    }

    // 7. Advice Text
    const adviceText = document.getElementById('adviceText');
    if (adviceText) adviceText.innerText = pred.action_advice;

    // 8. Feature Contributions Waterfall
    const contribList = document.getElementById('contributionsList');
    if (contribList && pred.contributions) {
        contribList.innerHTML = '';
        const topDrivers = pred.contributions.slice(0, 5);

        topDrivers.forEach(d => {
            const item = document.createElement('div');
            item.className = 'contrib-item';
            const isUp = d.contribution >= 0;
            const sign = isUp ? '+' : '';
            const cls = isUp ? 'up' : 'down';
            item.innerHTML = `
                <span class="contrib-feat">${d.feature} (現值: ${d.value})</span>
                <span class="contrib-val ${cls}">${sign}${(d.contribution * 100).toFixed(2)}%</span>
            `;
            contribList.appendChild(item);
        });
    }
}


// ============================================================
// 50 STARTUPS INTERACTIVE PREDICTOR & GLOBAL PROBLEM SWITCHER
// ============================================================

const STARTUPS_PARAMS = {
    intercept: 50125.3438,
    rd_coef: 0.806023,
    admin_coef: -0.027004,
    mkt_coef: 0.026980,
    fl_coef: 198.7888,
    ny_coef: -41.8870,
    residual_std: 9439.207,
    t_crit: 2.0154,
    XtX_inv: [
        [0.532003, 9.324297e-07, -3.590270e-06, -5.475792e-07, -0.0346599, -0.0542324],
        [9.324297e-07, 2.417103e-11, -1.052275e-11, -6.709110e-12, 5.705196e-08, -1.174825e-07],
        [-3.590270e-06, -1.052275e-11, 3.061926e-11, 3.141638e-12, -6.576629e-08, 2.535729e-08],
        [-5.475792e-07, -6.709110e-12, 3.141638e-12, 3.298070e-12, -1.090787e-07, -3.109416e-10],
        [-0.0346599, 5.705196e-08, -6.576629e-08, -1.090787e-07, 0.1275405, 0.0607052],
        [-0.0542324, -1.174825e-07, 2.535729e-08, -3.109416e-10, 0.0607052, 0.1189893]
    ]
};

let startupsState = {
    rd: 165000,
    admin: 80000,
    mkt: 450000,
    state: "New York"
};

function initProblemSelector() {
    const selector = document.getElementById('problemSelector');
    if (selector) {
        selector.addEventListener('change', (e) => {
            applyProblemTheme(e.target.value);
        });
    }
}

function applyProblemTheme(problemKey) {
    const floodElements = document.querySelectorAll('.problem-flood');
    const startupsElements = document.querySelectorAll('.problem-startups');
    const badgeProblem = document.getElementById('currentProblemBadge');
    const badgeR2 = document.getElementById('currentR2Badge');
    const logoTitle = document.getElementById('headerLogoTitle');
    const logoSubtitle = document.getElementById('headerLogoSubtitle');

    if (problemKey === 'flood_prediction') {
        floodElements.forEach(el => el.style.display = '');
        startupsElements.forEach(el => el.style.display = 'none');
        if (badgeProblem) badgeProblem.textContent = '🌊 Flood Prediction (s4e5)';
        if (badgeR2) badgeR2.textContent = 'Test R² = 0.8792';
        if (logoTitle) logoTitle.innerHTML = 'HydroPredict AI <span>| 洪澇風險多元線性回歸決策系統</span>';
        if (logoSubtitle) logoSubtitle.textContent = 'AIoT HW2 ‧ Kaggle Playground Series s4e5 (20 Features) ‧ CRISP-DM Deployment';
        switchTab('tab-predict');
        debouncedPredict();
    } else if (problemKey === 'startups_profit') {
        floodElements.forEach(el => el.style.display = 'none');
        startupsElements.forEach(el => el.style.display = '');
        if (badgeProblem) badgeProblem.textContent = '💰 50 Startups Profit';
        if (badgeR2) badgeR2.textContent = 'Test R² = 0.9508';
        if (logoTitle) logoTitle.innerHTML = 'StartupValuate AI <span>| 50 新創公司利潤多元線性回歸分析系統</span>';
        if (logoSubtitle) logoSubtitle.textContent = 'AIoT HW2 ‧ 50 Startups Dataset (R&D, Admin, Marketing, State) ‧ CRISP-DM Deployment';
        switchTab('tab-predict');
        updateStartupsPrediction();
    } else if (problemKey === 'custom_url') {
        switchTab('tab-custom');
        if (badgeProblem) badgeProblem.textContent = '📥 自訂資料預測與分析';
        if (typeof window.ensureCustomDatasetInitialized === 'function') {
            window.ensureCustomDatasetInitialized();
        }
    }
}

function initStartupsControls() {
    const rdRange = document.getElementById('range-rd_spend');
    const adminRange = document.getElementById('range-admin_spend');
    const mktRange = document.getElementById('range-mkt_spend');
    const stateSelect = document.getElementById('select-state');

    if (rdRange) {
        rdRange.addEventListener('input', (e) => {
            startupsState.rd = parseFloat(e.target.value);
            document.getElementById('val-rd_spend').textContent = `$${startupsState.rd.toLocaleString()}`;
            document.querySelectorAll('[data-startups-preset]').forEach(b => b.classList.remove('active'));
            updateStartupsPrediction();
        });
    }

    if (adminRange) {
        adminRange.addEventListener('input', (e) => {
            startupsState.admin = parseFloat(e.target.value);
            document.getElementById('val-admin_spend').textContent = `$${startupsState.admin.toLocaleString()}`;
            document.querySelectorAll('[data-startups-preset]').forEach(b => b.classList.remove('active'));
            updateStartupsPrediction();
        });
    }

    if (mktRange) {
        mktRange.addEventListener('input', (e) => {
            startupsState.mkt = parseFloat(e.target.value);
            document.getElementById('val-mkt_spend').textContent = `$${startupsState.mkt.toLocaleString()}`;
            document.querySelectorAll('[data-startups-preset]').forEach(b => b.classList.remove('active'));
            updateStartupsPrediction();
        });
    }

    if (stateSelect) {
        stateSelect.addEventListener('change', (e) => {
            startupsState.state = e.target.value;
            document.querySelectorAll('[data-startups-preset]').forEach(b => b.classList.remove('active'));
            updateStartupsPrediction();
        });
    }

    const presets = {
        unicorn: { rd: 165000, admin: 80000, mkt: 450000, state: "New York" },
        marketing_growth: { rd: 80000, admin: 150000, mkt: 400000, state: "California" },
        lean_bootstrapped: { rd: 100000, admin: 50000, mkt: 50000, state: "Florida" },
        industry_average: { rd: 73721, admin: 121344, mkt: 211025, state: "New York" }
    };

    document.querySelectorAll('[data-startups-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetKey = btn.getAttribute('data-startups-preset');
            const p = presets[presetKey];
            if (!p) return;

            document.querySelectorAll('[data-startups-preset]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            startupsState = { ...p };
            if (rdRange) { rdRange.value = p.rd; document.getElementById('val-rd_spend').textContent = `$${p.rd.toLocaleString()}`; }
            if (adminRange) { adminRange.value = p.admin; document.getElementById('val-admin_spend').textContent = `$${p.admin.toLocaleString()}`; }
            if (mktRange) { mktRange.value = p.mkt; document.getElementById('val-mkt_spend').textContent = `$${p.mkt.toLocaleString()}`; }
            if (stateSelect) stateSelect.value = p.state;

            updateStartupsPrediction();
        });
    });

    const resetBtn = document.getElementById('btnResetStartupsValues');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const unicornBtn = document.querySelector('[data-startups-preset="unicorn"]');
            if (unicornBtn) unicornBtn.click();
        });
    }
}

function updateStartupsPrediction() {
    const p = STARTUPS_PARAMS;
    const rd = startupsState.rd;
    const admin = startupsState.admin;
    const mkt = startupsState.mkt;
    const isFL = startupsState.state === 'Florida' ? 1.0 : 0.0;
    const isNY = startupsState.state === 'New York' ? 1.0 : 0.0;

    // Point Prediction
    const y_pred = p.intercept + p.rd_coef * rd + p.admin_coef * admin + p.mkt_coef * mkt + p.fl_coef * isFL + p.ny_coef * isNY;

    // Vector x0: [1, rd, admin, mkt, isFL, isNY]
    const x0 = [1.0, rd, admin, mkt, isFL, isNY];

    // Leverage h0 = x0^T * XtX_inv * x0
    let h0 = 0.0;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            h0 += x0[i] * p.XtX_inv[i][j] * x0[j];
        }
    }
    h0 = Math.max(0.0001, h0);

    const s = p.residual_std;
    const se_mean = Math.sqrt(s * s * h0);
    const se_pred = Math.sqrt(s * s * (1.0 + h0));

    const ci_low = y_pred - p.t_crit * se_mean;
    const ci_high = y_pred + p.t_crit * se_mean;
    const pi_low = y_pred - p.t_crit * se_pred;
    const pi_high = y_pred + p.t_crit * se_pred;

    // Update Big Dollar Number
    const predValEl = document.getElementById('startupsPredValue');
    if (predValEl) predValEl.textContent = Math.round(y_pred).toLocaleString();

    // Profit Tier Badge
    const badgeEl = document.getElementById('startupsRiskBadge');
    let tierBadge = '🦄 卓越獨角獸 (Unicorn)';
    let tierColor = '#c084fc';
    let tierAdvice = '強力看好：該新創具備優異之研發投入效率，獲利能力位於全美前 5% 頂尖區間。建議追加投資，並維持高額技術研發比例，嚴格控管行政開銷。';

    if (y_pred >= 150000) {
        tierBadge = '🦄 卓越獨角獸 (Unicorn)';
        tierColor = '#c084fc';
        tierAdvice = '強烈建議投資：研發轉化率極高，獲利能力位於全美前 5% 頂尖梯隊。建議領投後續 A 輪，擴大市場護城河。';
    } else if (y_pred >= 100000) {
        tierBadge = '📈 穩健成長企業 (Growth)';
        tierColor = '#38bdf8';
        tierAdvice = '評等優良：年度利潤表現穩健，資本結構平衡。可適度追加行銷預算加速獲客，並確保研發經費佔比不低於 40%。';
    } else if (y_pred >= 50000) {
        tierBadge = '⚖️ 損益平衡狀態 (Break-even)';
        tierColor = '#fbbf24';
        tierAdvice = '審慎觀望：當前獲利空間有限，易受外部市場波動衝擊。建議精簡行政後勤管理支出，將有限現金流聚焦於核心產品研發。';
    } else {
        tierBadge = '⚠️ 赤字虧損風險 (High Risk)';
        tierColor = '#f87171';
        tierAdvice = '高風險預警：研發投入嚴重不足或固定成本過高，預估利潤逼近虧損警戒線。建議創投暫緩注資，要求團隊進行商業模式重組。';
    }

    if (badgeEl) {
        badgeEl.textContent = tierBadge;
        badgeEl.style.color = tierColor;
    }

    // Progress Bar (scaled to max $250k)
    const fillEl = document.getElementById('startupsProbFill');
    if (fillEl) {
        const pct = Math.min(100, Math.max(5, (y_pred / 250000) * 100));
        fillEl.style.width = `${pct}%`;
        fillEl.style.background = tierColor;
    }

    // CI Box
    const ciValEl = document.getElementById('startupsCiValue');
    const ciWidthEl = document.getElementById('startupsCiWidth');
    if (ciValEl) ciValEl.textContent = `[$${Math.round(ci_low).toLocaleString()}, $${Math.round(ci_high).toLocaleString()}]`;
    if (ciWidthEl) ciWidthEl.textContent = `母體平均利潤半寬: ±$${Math.round(p.t_crit * se_mean).toLocaleString()}`;

    // PI Box
    const piValEl = document.getElementById('startupsPiValue');
    const piWidthEl = document.getElementById('startupsPiWidth');
    if (piValEl) piValEl.textContent = `[$${Math.round(pi_low).toLocaleString()}, $${Math.round(pi_high).toLocaleString()}]`;
    if (piWidthEl) piWidthEl.textContent = `單一新創預測半寬: ±$${Math.round(p.t_crit * se_pred).toLocaleString()}`;

    // Visual Interval Gauge (scaled to 0 ~ 250k)
    const ivPiBand = document.getElementById('startupsIvPiBand');
    const ivCiBand = document.getElementById('startupsIvCiBand');
    const ivPointer = document.getElementById('startupsIvPointer');

    if (ivPiBand && ivCiBand && ivPointer) {
        const maxVal = 250000;
        const piLeft = Math.max(0, (pi_low / maxVal) * 100);
        const piRight = Math.min(100, (pi_high / maxVal) * 100);
        ivPiBand.style.left = `${piLeft}%`;
        ivPiBand.style.width = `${Math.max(2, piRight - piLeft)}%`;

        const ciLeft = Math.max(0, (ci_low / maxVal) * 100);
        const ciRight = Math.min(100, (ci_high / maxVal) * 100);
        ivCiBand.style.left = `${ciLeft}%`;
        ivCiBand.style.width = `${Math.max(1.5, ciRight - ciLeft)}%`;

        const ptPos = Math.min(100, Math.max(0, (y_pred / maxVal) * 100));
        ivPointer.style.left = `${ptPos}%`;
    }

    // Advice Text
    const adviceEl = document.getElementById('startupsAdviceText');
    if (adviceEl) adviceEl.textContent = tierAdvice;

    // Waterfall Breakdown
    const listEl = document.getElementById('startupsContributionsList');
    if (listEl) {
        listEl.innerHTML = '';
        const rdCont = p.rd_coef * rd;
        const mktCont = p.mkt_coef * mkt;
        const adminCont = p.admin_coef * admin;
        const stateCont = p.fl_coef * isFL + p.ny_coef * isNY;

        const items = [
            { name: `研發技術投入 (+$${rd.toLocaleString()})`, val: rdCont, isPositive: true },
            { name: `市場廣告獲客 (+$${mkt.toLocaleString()})`, val: mktCont, isPositive: true },
            { name: `公司行政開銷 (-$${admin.toLocaleString()})`, val: adminCont, isPositive: false },
            { name: `州別營運聚落 (${startupsState.state})`, val: stateCont, isPositive: stateCont >= 0 }
        ];

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'contrib-item';
            const cls = item.isPositive ? 'up' : 'down';
            const sign = item.val >= 0 ? '+' : '';
            div.innerHTML = `
                <span class="contrib-feat">${item.name}</span>
                <span class="contrib-val ${cls}">${sign}$${Math.round(item.val).toLocaleString()} USD</span>
            `;
            listEl.appendChild(div);
        });
    }
}
