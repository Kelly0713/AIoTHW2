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
    tryFetchServerPresets();
    setupListeners();
    triggerPrediction();
});

// Tab Switching
function initTabs() {
    const tabBtns = document.querySelectorAll('.nav-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
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
