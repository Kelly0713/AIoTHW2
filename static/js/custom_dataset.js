/**
 * Custom Dataset & Problem Switcher Module
 * Bonus Features:
 *   +1 pt: Dropdown to switch between two pre-built problems
 *   +2 pt: Arbitrary CSV URL input for custom datasets
 *
 * Implements client-side Multiple Linear Regression (OLS) with:
 *   - CSV parsing (PapaParse)
 *   - Feature selection (correlation-based)
 *   - Train/test split
 *   - R², RMSE, MAE, Adjusted R²
 *   - 95% Confidence & Prediction Intervals
 *   - Residual diagnostics
 *   - Dynamic Chart.js visualizations
 */

// ============================================================
// Problem Definitions (Bonus +1: Dropdown with 2 problems)
// ============================================================
const PROBLEM_DEFINITIONS = {
    flood_prediction: {
        name: '🌊 Flood Prediction (Kaggle s4e5)',
        description: 'Kaggle Playground Series s4e5 洪澇風險預測 — 20 個數值特徵預測 FloodProbability',
        csvUrl: '',
        target: 'FloodProbability',
        isBuiltIn: true,
        features: 20,
        source: 'https://www.kaggle.com/competitions/playground-series-s4e5'
    },
    startups_profit: {
        name: '💰 50 Startups Profit Prediction',
        description: '50 間新創公司利潤預測 — R&D Spend, Administration, Marketing Spend, State 預測 Profit',
        csvUrl: 'https://raw.githubusercontent.com/Avik-Jain/100-Days-Of-ML-Code/master/datasets/50_Startups.csv',
        target: 'Profit',
        isBuiltIn: false,
        features: 4,
        source: 'https://github.com/Avik-Jain/100-Days-Of-ML-Code'
    }
};

// ============================================================
// State
// ============================================================
let customDatasetState = {
    currentProblem: 'flood_prediction',
    rawData: null,
    parsedData: null,
    features: [],
    target: '',
    trainX: null,
    trainY: null,
    testX: null,
    testY: null,
    model: null,
    charts: {}
};

// ============================================================
// Initialize Problem Switcher
// ============================================================
function initProblemSwitcher() {
    const selector = document.getElementById('problemSelector');
    const urlInput = document.getElementById('customDatasetUrl');
    const loadBtn = document.getElementById('btnLoadDataset');
    const targetSelect = document.getElementById('targetColumnSelect');

    if (!selector) return;

    // Problem dropdown change
    selector.addEventListener('change', (e) => {
        const problemKey = e.target.value;
        if (problemKey === 'custom_url') {
            showCustomUrlPanel(true);
            switchTab('tab-custom');
            updateProblemBadge({ name: '📥 自訂 CSV 資料集' });
        } else {
            showCustomUrlPanel(false);
            switchToProblem(problemKey);
        }
    });

    // Load custom dataset button
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            const url = urlInput?.value?.trim();
            if (!url) {
                showNotification('請輸入有效的 CSV URL', 'error');
                return;
            }
            loadCustomDataset(url);
        });
    }

    // Target column change
    if (targetSelect) {
        targetSelect.addEventListener('change', () => {
            if (customDatasetState.parsedData) {
                runCustomAnalysis();
            }
        });
    }
}

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

function showCustomUrlPanel(show) {
    const panel = document.getElementById('customUrlPanel');
    if (panel) panel.style.display = show ? 'block' : 'none';
}

function hideBuiltInUI(hide) {
    // Controlled via tab system
}

function switchToProblem(problemKey) {
    customDatasetState.currentProblem = problemKey;
    const problem = PROBLEM_DEFINITIONS[problemKey];

    if (!problem) return;

    if (problem.isBuiltIn) {
        switchTab('tab-predict');
        updateProblemBadge(problem);
        showCustomUrlPanel(false);
    } else {
        switchTab('tab-custom');
        updateProblemBadge(problem);
        showCustomUrlPanel(false);
        // Auto-load the CSV
        const urlInput = document.getElementById('customDatasetUrl');
        if (urlInput) urlInput.value = problem.csvUrl;
        const inlineUrlInput = document.getElementById('customDatasetUrlInline');
        if (inlineUrlInput) inlineUrlInput.value = problem.csvUrl;
        loadCustomDataset(problem.csvUrl, problem.target);
    }
}

function updateProblemBadge(problem) {
    const badge = document.getElementById('currentProblemBadge');
    if (badge) {
        badge.textContent = problem.name;
    }
}


// Embedded 50 Startups CSV for 100% offline & file:/// instant reliability
const LOCAL_50_STARTUPS_CSV = `R&D Spend,Administration,Marketing Spend,State,Profit
165349.2,136897.8,471784.1,New York,192261.83
162597.7,151377.59,443898.53,California,191792.06
153441.51,101145.55,407934.54,Florida,191050.39
144372.41,118671.85,383199.62,New York,182901.99
142107.34,91391.77,366168.42,Florida,166187.94
131876.9,99814.71,362861.36,New York,156991.12
134615.46,147198.87,127716.82,California,156122.51
130298.13,145530.06,323876.68,Florida,155752.6
120542.52,148718.95,311613.29,New York,152211.77
123334.88,108679.17,304981.62,California,149759.96
101913.08,110594.11,229160.95,Florida,146121.95
100671.96,91790.61,249744.55,California,144259.4
93863.75,127320.38,249839.44,Florida,141585.52
91992.39,135495.07,252664.93,California,134307.35
119943.24,156547.42,256512.92,Florida,132602.65
114523.61,122616.84,261776.23,New York,129917.04
78013.11,121597.55,264346.06,California,126992.93
94657.16,145077.58,282574.31,New York,125370.37
91749.16,114175.79,294919.57,Florida,124266.9
86419.7,153514.11,0,New York,122776.86
76253.86,113867.3,298664.47,California,118474.03
78389.47,153773.43,299737.29,New York,111313.02
73994.56,122782.75,303319.26,Florida,110352.25
67532.53,105751.03,304768.73,Florida,108733.99
77044.01,99281.34,140574.81,New York,108552.04
64664.71,139553.16,137962.62,California,107404.34
75328.87,144135.98,134050.07,Florida,105733.54
72107.6,127864.55,353183.81,New York,105008.31
66051.52,182645.56,118148.2,Florida,103282.38
65605.48,153032.06,107138.38,New York,101004.64
61994.48,115641.28,91131.24,Florida,99937.59
61136.38,152701.92,88218.23,New York,97483.56
63408.86,129219.61,46085.25,California,97427.84
55493.95,103057.49,214634.81,Florida,96778.92
46426.07,157693.92,210797.67,California,96712.8
46014.02,85047.44,205517.64,New York,96479.51
28663.76,127056.21,201126.82,Florida,90708.19
44069.95,51283.14,197029.42,California,89949.14
20229.59,65947.93,185265.1,New York,81229.06
38558.51,82982.09,174999.3,California,81005.76
28754.33,118546.05,172795.67,California,78239.91
27892.92,84710.77,164470.71,Florida,77798.83
23640.93,96189.63,148001.11,California,71498.49
15505.73,127382.3,35534.17,New York,69758.98
22177.74,154806.14,28334.72,California,65200.33
1000.23,124153.04,1903.93,New York,64926.08
1315.46,115816.21,297114.46,Florida,49490.75
0,135426.92,0,California,42559.73
542.05,51743.15,0,New York,35673.41
0,116983.8,45173.06,California,14681.4`;

function setLoadStatus(html, statusClass, percent) {
    ['datasetLoadStatus', 'datasetLoadStatusInline'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = html;
            el.className = `dataset-status ${statusClass}`;
        }
    });
    ['loadProgressBar', 'loadProgressBarInline'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${percent}%`;
    });
}

async function loadCustomDataset(url, presetTarget) {
    setLoadStatus('<span class="loading-spinner"></span> 正在載入資料集...', 'loading', 30);

    try {
        let csvText = '';
        if (url.includes('50_Startups')) {
            csvText = LOCAL_50_STARTUPS_CSV;
        } else {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    csvText = await response.text();
                }
            } catch (netErr) {
                console.warn('Direct fetch failed, trying proxy...', netErr);
            }
            if (!csvText) {
                try {
                    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                    const res = await fetch(proxyUrl);
                    if (res.ok) csvText = await res.text();
                } catch (e1) {
                    const proxyUrl2 = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
                    const res2 = await fetch(proxyUrl2);
                    if (res2.ok) csvText = await res2.text();
                }
            }
        }

        if (!csvText || csvText.trim().length === 0) {
            throw new Error('無法取得 CSV 內容，請檢查網址或網路連線。');
        }

        setLoadStatus('正在解析資料與特徵...', 'loading', 65);

        const parsed = Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        if (parsed.errors.length > 0 && parsed.data.length === 0) {
            throw new Error('CSV 解析失敗: ' + parsed.errors[0].message);
        }

        customDatasetState.rawData = csvText;
        customDatasetState.parsedData = parsed.data;

        // Populate column selectors in tab-custom
        populateColumnSelectors(parsed.meta.fields, presetTarget);

        setLoadStatus('正在進行多元線性回歸 OLS 模型擬合與區間推論...', 'loading', 85);

        // Run analysis
        runCustomAnalysis();

        setLoadStatus(`✅ 成功載入 ${parsed.data.length} 筆資料 (${parsed.meta.fields.length} 個欄位)，已完成模型訓練與圖表繪製！`, 'success', 100);

        // Ensure user is on custom tab and scroll to results
        switchTab('tab-custom');
        const container = document.getElementById('customResultsContainer');
        if (container) {
            setTimeout(() => {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }

    } catch (err) {
        console.error('Dataset load error:', err);
        setLoadStatus(`❌ 載入失敗: ${err.message}`, 'error', 0);
    }
}

function populateColumnSelectors(fields, presetTarget) {
    ['targetColumnSelect', 'targetColumnSelectInline'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '';
        fields.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            if (presetTarget && f === presetTarget) opt.selected = true;
            select.appendChild(opt);
        });
        if (!presetTarget) {
            // Pick 'Profit', 'charges', 'quality', or last field
            if (fields.includes('Profit')) select.value = 'Profit';
            else if (fields.includes('charges')) select.value = 'charges';
            else if (fields.includes('quality')) select.value = 'quality';
            else select.value = fields[fields.length - 1];
        }
        
        select.onchange = () => {
            runCustomAnalysis();
        };
    });
}
);

    // If no preset, try to auto-detect a target
    if (!presetTarget) {
        const lastField = fields[fields.length - 1];
        targetSelect.value = lastField;
    }
}

// ============================================================
// Client-Side OLS Multiple Linear Regression Engine
// ============================================================
function runCustomAnalysis() {
    const data = customDatasetState.parsedData;
    if (!data || data.length === 0) return;

    const targetSelect = document.getElementById('targetColumnSelectInline') || document.getElementById('targetColumnSelect');
    let targetCol = targetSelect?.value;
    if (!targetCol && data[0]) {
        const keys = Object.keys(data[0]);
        targetCol = keys.includes('Profit') ? 'Profit' : keys[keys.length - 1];
    }
    if (!targetCol) return;

    // Determine numeric columns (exclude target)
    const allCols = Object.keys(data[0]);
    const numericCols = allCols.filter(col => {
        if (col === targetCol) return false;
        // Check if mostly numeric
        let numCount = 0;
        const sampleSize = Math.min(data.length, 50);
        for (let i = 0; i < sampleSize; i++) {
            if (typeof data[i][col] === 'number' && !isNaN(data[i][col])) numCount++;
        }
        return numCount / sampleSize > 0.8;
    });

    // Handle categorical columns (one-hot encoding)
    const categoricalCols = allCols.filter(col => {
        if (col === targetCol) return false;
        if (numericCols.includes(col)) return false;
        let strCount = 0;
        const sampleSize = Math.min(data.length, 50);
        for (let i = 0; i < sampleSize; i++) {
            if (typeof data[i][col] === 'string') strCount++;
        }
        return strCount / sampleSize > 0.5;
    });

    // Build feature matrix with one-hot encoding
    let featureNames = [...numericCols];
    let encodedData = data.map(row => {
        const encoded = {};
        numericCols.forEach(col => {
            encoded[col] = typeof row[col] === 'number' ? row[col] : 0;
        });
        encoded[targetCol] = typeof row[targetCol] === 'number' ? row[targetCol] : parseFloat(row[targetCol]) || 0;
        return encoded;
    });

    // One-hot encode categoricals
    const categoryMaps = {};
    categoricalCols.forEach(col => {
        const uniqueVals = [...new Set(data.map(r => r[col]).filter(v => v != null))];
        categoryMaps[col] = uniqueVals;
        // Skip the first category (reference encoding)
        uniqueVals.slice(1).forEach(val => {
            const featureName = `${col}_${val}`;
            featureNames.push(featureName);
            encodedData.forEach((row, i) => {
                row[featureName] = data[i][col] === val ? 1 : 0;
            });
        });
    });

    // Filter out rows with NaN target
    encodedData = encodedData.filter(row => !isNaN(row[targetCol]) && row[targetCol] !== null);

    if (encodedData.length < 10) {
        showNotification('有效資料筆數不足 (需至少 10 筆)', 'error');
        return;
    }

    // Limit features to 39 max (as per assignment: < 40)
    if (featureNames.length > 39) {
        // Use correlation-based selection to pick top 39
        featureNames = selectTopFeaturesByCorrelation(encodedData, featureNames, targetCol, 39);
    }

    customDatasetState.features = featureNames;
    customDatasetState.target = targetCol;

    // Train/Test split (80/20, deterministic)
    const splitIdx = Math.floor(encodedData.length * 0.8);
    const shuffled = seededShuffle(encodedData, 42);
    const trainData = shuffled.slice(0, splitIdx);
    const testData = shuffled.slice(splitIdx);

    // Build matrices
    const trainX = trainData.map(row => featureNames.map(f => row[f] || 0));
    const trainY = trainData.map(row => row[targetCol]);
    const testX = testData.map(row => featureNames.map(f => row[f] || 0));
    const testY = testData.map(row => row[targetCol]);

    customDatasetState.trainX = trainX;
    customDatasetState.trainY = trainY;
    customDatasetState.testX = testX;
    customDatasetState.testY = testY;

    // Fit OLS
    const model = fitOLS(trainX, trainY);
    customDatasetState.model = model;

    // Predictions
    const trainPred = predictOLS(model, trainX);
    const testPred = predictOLS(model, testX);

    // Metrics
    const metrics = computeMetrics(trainY, trainPred, testY, testPred, featureNames.length);

    // Confidence & Prediction Intervals for test set
    const intervals = computeIntervals(model, testX, testY, testPred);

    // Residuals
    const testResiduals = testY.map((y, i) => y - testPred[i]);

    // Render results
    renderCustomResults({
        featureNames, targetCol, model, metrics, intervals,
        trainData, testData, testY, testPred, testResiduals,
        encodedData, categoricalCols, categoryMaps
    });
}

function selectTopFeaturesByCorrelation(data, features, target, maxFeatures) {
    const correlations = features.map(f => {
        const vals = data.map(r => r[f] || 0);
        const tVals = data.map(r => r[target]);
        return { feature: f, corr: Math.abs(pearsonCorrelation(vals, tVals)) };
    });
    correlations.sort((a, b) => b.corr - a.corr);
    return correlations.slice(0, maxFeatures).map(c => c.feature);
}

function pearsonCorrelation(x, y) {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i]; sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i]; sumY2 += y[i] * y[i];
    }
    const num = n * sumXY - sumX * sumY;
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return den === 0 ? 0 : num / den;
}

function seededShuffle(arr, seed) {
    const copy = [...arr];
    let m = copy.length;
    while (m) {
        seed = (seed * 16807 + 0) % 2147483647;
        const i = seed % m--;
        [copy[m], copy[i]] = [copy[i], copy[m]];
    }
    return copy;
}

// ============================================================
// OLS via Normal Equation: β = (X'X)^(-1) X'y
// ============================================================
function fitOLS(X, y) {
    const n = X.length;
    const p = X[0].length;

    // Augment X with intercept column
    const Xa = X.map(row => [1, ...row]);
    const pAug = p + 1;

    // Compute X'X
    const XtX = Array.from({ length: pAug }, () => new Float64Array(pAug));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < pAug; j++) {
            for (let k = j; k < pAug; k++) {
                XtX[j][k] += Xa[i][j] * Xa[i][k];
            }
        }
    }
    // Symmetrize
    for (let j = 0; j < pAug; j++) {
        for (let k = 0; k < j; k++) {
            XtX[j][k] = XtX[k][j];
        }
    }

    // Compute X'y
    const Xty = new Float64Array(pAug);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < pAug; j++) {
            Xty[j] += Xa[i][j] * y[i];
        }
    }

    // Solve via Cholesky or simple Gauss-Jordan
    const XtX_inv = invertMatrix(XtX, pAug);
    
    // β = (X'X)^(-1) X'y
    const beta = new Float64Array(pAug);
    for (let j = 0; j < pAug; j++) {
        for (let k = 0; k < pAug; k++) {
            beta[j] += XtX_inv[j][k] * Xty[k];
        }
    }

    // Compute residual std
    const yPred = Xa.map(row => {
        let sum = 0;
        for (let j = 0; j < pAug; j++) sum += row[j] * beta[j];
        return sum;
    });
    
    let sse = 0;
    for (let i = 0; i < n; i++) sse += (y[i] - yPred[i]) ** 2;
    const residualStd = Math.sqrt(sse / (n - pAug));

    return {
        intercept: beta[0],
        coefficients: Array.from(beta.slice(1)),
        XtX_inv: XtX_inv.map(row => Array.from(row)),
        residualStd,
        n,
        p: pAug,
        sse
    };
}

function invertMatrix(mat, n) {
    // Gauss-Jordan elimination
    const aug = Array.from({ length: n }, (_, i) => {
        const row = new Float64Array(2 * n);
        for (let j = 0; j < n; j++) row[j] = mat[i][j];
        row[n + i] = 1;
        return row;
    });

    for (let col = 0; col < n; col++) {
        // Partial pivoting
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
        }
        [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

        const pivot = aug[col][col];
        if (Math.abs(pivot) < 1e-12) {
            // Add regularization (Ridge-like)
            aug[col][col] += 1e-8;
        }
        const piv = aug[col][col];
        for (let j = 0; j < 2 * n; j++) aug[col][j] /= piv;

        for (let row = 0; row < n; row++) {
            if (row === col) continue;
            const factor = aug[row][col];
            for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j];
        }
    }

    return aug.map(row => row.slice(n));
}

function predictOLS(model, X) {
    return X.map(row => {
        let sum = model.intercept;
        for (let i = 0; i < row.length; i++) {
            sum += row[i] * model.coefficients[i];
        }
        return sum;
    });
}

// ============================================================
// Metrics
// ============================================================
function computeMetrics(trainY, trainPred, testY, testPred, numFeatures) {
    const trainR2 = rSquared(trainY, trainPred);
    const testR2 = rSquared(testY, testPred);
    const n = testY.length;
    const p = numFeatures;
    const adjR2 = 1 - (1 - testR2) * (n - 1) / (n - p - 1);

    return {
        trainR2,
        testR2,
        adjR2,
        testRMSE: rmse(testY, testPred),
        testMAE: mae(testY, testPred),
        trainSamples: trainY.length,
        testSamples: testY.length,
        numFeatures: numFeatures
    };
}

function rSquared(actual, predicted) {
    const mean = actual.reduce((s, v) => s + v, 0) / actual.length;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < actual.length; i++) {
        ssTot += (actual[i] - mean) ** 2;
        ssRes += (actual[i] - predicted[i]) ** 2;
    }
    return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}

function rmse(actual, predicted) {
    let sum = 0;
    for (let i = 0; i < actual.length; i++) sum += (actual[i] - predicted[i]) ** 2;
    return Math.sqrt(sum / actual.length);
}

function mae(actual, predicted) {
    let sum = 0;
    for (let i = 0; i < actual.length; i++) sum += Math.abs(actual[i] - predicted[i]);
    return sum / actual.length;
}

// ============================================================
// Confidence & Prediction Intervals
// ============================================================
function computeIntervals(model, testX, testY, testPred) {
    const t_crit = 1.96;
    const s = model.residualStd;
    const XtX_inv = model.XtX_inv;

    const intervals = testPred.map((yhat, idx) => {
        const x = [1, ...testX[idx]];
        const p = x.length;

        // Leverage: h = x' (X'X)^(-1) x
        let leverage = 0;
        for (let r = 0; r < p; r++) {
            let dot = 0;
            for (let c = 0; c < p; c++) {
                dot += XtX_inv[r][c] * x[c];
            }
            leverage += x[r] * dot;
        }

        const seMean = Math.sqrt(s * s * Math.max(0, leverage));
        const sePred = Math.sqrt(s * s * (1 + Math.max(0, leverage)));

        return {
            predicted: yhat,
            actual: testY[idx],
            ci_low: yhat - t_crit * seMean,
            ci_high: yhat + t_crit * seMean,
            pi_low: yhat - t_crit * sePred,
            pi_high: yhat + t_crit * sePred,
            seMean,
            sePred
        };
    });

    return intervals;
}

// ============================================================
// UI Rendering
// ============================================================
function renderCustomResults(results) {
    const container = document.getElementById('customResultsContainer');
    if (!container) return;

    const { featureNames, targetCol, model, metrics, intervals,
            testY, testPred, testResiduals } = results;

    // Sort intervals by predicted value for clean chart
    const sortedIntervals = [...intervals].sort((a, b) => a.predicted - b.predicted);

    container.innerHTML = `
        <!-- Dataset Summary -->
        <div class="glass-card mb-4 dataset-summary-card">
            <div class="summary-grid">
                <div class="summary-stat">
                    <div class="stat-value">${metrics.trainSamples + metrics.testSamples}</div>
                    <div class="stat-label">總樣本數</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${metrics.numFeatures}</div>
                    <div class="stat-label">特徵數</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${metrics.trainSamples}</div>
                    <div class="stat-label">訓練集 (80%)</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${metrics.testSamples}</div>
                    <div class="stat-label">測試集 (20%)</div>
                </div>
            </div>
        </div>

        <!-- Performance Metrics -->
        <div class="glass-card mb-4">
            <h3 class="card-title">📊 模型評估指標 (Model Evaluation Metrics)</h3>
            <div class="metrics-showcase">
                <div class="metric-pill r2-pill">
                    <span class="metric-label">Train R²</span>
                    <span class="metric-value">${metrics.trainR2.toFixed(4)}</span>
                </div>
                <div class="metric-pill r2-pill highlight-pill">
                    <span class="metric-label">Test R²</span>
                    <span class="metric-value">${metrics.testR2.toFixed(4)}</span>
                </div>
                <div class="metric-pill">
                    <span class="metric-label">Adj. R²</span>
                    <span class="metric-value">${metrics.adjR2.toFixed(4)}</span>
                </div>
                <div class="metric-pill">
                    <span class="metric-label">RMSE</span>
                    <span class="metric-value">${metrics.testRMSE.toFixed(4)}</span>
                </div>
                <div class="metric-pill">
                    <span class="metric-label">MAE</span>
                    <span class="metric-value">${metrics.testMAE.toFixed(4)}</span>
                </div>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="custom-charts-grid">
            <!-- Actual vs Predicted with CI/PI -->
            <div class="glass-card plot-card">
                <h3 class="plot-title">預測值 vs 真實值 (含 95% CI & PI 帶)</h3>
                <p class="plot-desc">紅點為測試集觀測值；藍線為回歸擬合線；藍色帶為 95% CI；灰色帶為 95% PI</p>
                <div class="chart-container">
                    <canvas id="customActualVsPredChart"></canvas>
                </div>
            </div>

            <!-- Residuals -->
            <div class="glass-card plot-card">
                <h3 class="plot-title">殘差分析 (Residual Analysis)</h3>
                <p class="plot-desc">殘差 vs 預測值散佈圖，檢驗同質變異性與線性假設</p>
                <div class="chart-container">
                    <canvas id="customResidualChart"></canvas>
                </div>
            </div>

            <!-- Feature Coefficients -->
            <div class="glass-card plot-card">
                <h3 class="plot-title">特徵回歸係數 (Feature Coefficients)</h3>
                <p class="plot-desc">各特徵在多元線性回歸模型中的權重大小與方向</p>
                <div class="chart-container">
                    <canvas id="customCoefChart"></canvas>
                </div>
            </div>

            <!-- Residual Distribution -->
            <div class="glass-card plot-card">
                <h3 class="plot-title">殘差分布直方圖 (Residual Distribution)</h3>
                <p class="plot-desc">檢驗殘差是否近似常態分布 (Normal Distribution)</p>
                <div class="chart-container">
                    <canvas id="customResidualHistChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Regression Equation -->
        <div class="glass-card mb-4">
            <h3 class="card-title">📐 回歸方程式 (Regression Equation)</h3>
            <div class="equation-box">
                <code class="equation-code">${targetCol} = ${model.intercept.toFixed(4)}${featureNames.map((f, i) => ` ${model.coefficients[i] >= 0 ? '+' : ''}${model.coefficients[i].toFixed(4)} × ${f}`).join('')}</code>
            </div>
        </div>

        <!-- Feature Coefficients Table -->
        <div class="glass-card mb-4">
            <h3 class="card-title">📋 特徵係數一覽表 (Coefficients Detail)</h3>
            <div class="assumptions-table-wrapper">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>特徵名稱</th>
                            <th>回歸係數 (β)</th>
                            <th>|β| 影響力</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${featureNames
                            .map((f, i) => ({ name: f, coef: model.coefficients[i] }))
                            .sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef))
                            .map((item, idx) => `
                                <tr${idx === 0 ? ' class="highlight-row"' : ''}>
                                    <td>${idx + 1}</td>
                                    <td><b>${item.name}</b></td>
                                    <td><code>${item.coef >= 0 ? '+' : ''}${item.coef.toFixed(6)}</code></td>
                                    <td><code>${Math.abs(item.coef).toFixed(6)}</code></td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Render charts after DOM update
    requestAnimationFrame(() => {
        renderActualVsPredChart(sortedIntervals);
        renderResidualChart(testPred, testResiduals);
        renderCoefChart(featureNames, model.coefficients);
        renderResidualHistChart(testResiduals);
    });
}

// ============================================================
// Chart.js Visualizations
// ============================================================
function renderActualVsPredChart(intervals) {
    const ctx = document.getElementById('customActualVsPredChart');
    if (!ctx) return;

    // Destroy old chart
    if (customDatasetState.charts.actualVsPred) {
        customDatasetState.charts.actualVsPred.destroy();
    }

    const labels = intervals.map((_, i) => i + 1);

    customDatasetState.charts.actualVsPred = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: '95% PI Upper',
                    data: intervals.map(d => d.pi_high),
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(148, 163, 184, 0.15)',
                    fill: '+1',
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: '95% PI Lower',
                    data: intervals.map(d => d.pi_low),
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(148, 163, 184, 0.15)',
                    fill: false,
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: '95% CI Upper',
                    data: intervals.map(d => d.ci_high),
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(56, 189, 248, 0.25)',
                    fill: '+1',
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: '95% CI Lower',
                    data: intervals.map(d => d.ci_low),
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(56, 189, 248, 0.25)',
                    fill: false,
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: 'Predicted (Fitted Line)',
                    data: intervals.map(d => d.predicted),
                    borderColor: '#38bdf8',
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: 'Actual (Test Set)',
                    data: intervals.map(d => d.actual),
                    borderColor: 'transparent',
                    backgroundColor: '#f43f5e',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { size: 11 } },
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Sorted Sample Index', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                y: {
                    title: { display: true, text: 'Value', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                }
            }
        }
    });
}

function renderResidualChart(predicted, residuals) {
    const ctx = document.getElementById('customResidualChart');
    if (!ctx) return;

    if (customDatasetState.charts.residual) {
        customDatasetState.charts.residual.destroy();
    }

    const scatterData = predicted.map((p, i) => ({ x: p, y: residuals[i] }));

    customDatasetState.charts.residual = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Residuals vs Predicted',
                data: scatterData,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 0.8)',
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8' } },
                annotation: {}
            },
            scales: {
                x: {
                    title: { display: true, text: 'Predicted Value', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                y: {
                    title: { display: true, text: 'Residual', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                }
            }
        }
    });
}

function renderCoefChart(featureNames, coefficients) {
    const ctx = document.getElementById('customCoefChart');
    if (!ctx) return;

    if (customDatasetState.charts.coef) {
        customDatasetState.charts.coef.destroy();
    }

    // Sort by absolute value
    const sorted = featureNames.map((f, i) => ({ name: f, coef: coefficients[i] }))
        .sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef))
        .slice(0, 20); // Show top 20

    customDatasetState.charts.coef = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(d => d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name),
            datasets: [{
                label: 'Regression Coefficient (β)',
                data: sorted.map(d => d.coef),
                backgroundColor: sorted.map(d => d.coef >= 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(244, 63, 94, 0.7)'),
                borderColor: sorted.map(d => d.coef >= 0 ? '#38bdf8' : '#f43f5e'),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Coefficient Value', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                y: {
                    ticks: { color: '#94a3b8', font: { size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                }
            }
        }
    });
}

function renderResidualHistChart(residuals) {
    const ctx = document.getElementById('customResidualHistChart');
    if (!ctx) return;

    if (customDatasetState.charts.residHist) {
        customDatasetState.charts.residHist.destroy();
    }

    // Create histogram bins
    const min = Math.min(...residuals);
    const max = Math.max(...residuals);
    const numBins = Math.min(30, Math.ceil(Math.sqrt(residuals.length)));
    const binWidth = (max - min) / numBins || 1;
    const bins = Array.from({ length: numBins }, (_, i) => ({
        low: min + i * binWidth,
        high: min + (i + 1) * binWidth,
        count: 0
    }));

    residuals.forEach(r => {
        const idx = Math.min(numBins - 1, Math.floor((r - min) / binWidth));
        if (idx >= 0 && idx < bins.length) bins[idx].count++;
    });

    customDatasetState.charts.residHist = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.map(b => ((b.low + b.high) / 2).toFixed(3)),
            datasets: [{
                label: 'Frequency',
                data: bins.map(b => b.count),
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: '#6366f1',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Residual Value', color: '#94a3b8' },
                    ticks: { color: '#64748b', maxRotation: 45 },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                y: {
                    title: { display: true, text: 'Frequency', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                }
            }
        }
    });
}

// ============================================================
// Notification Helper
// ============================================================
function showNotification(message, type) {
    const statusEl = document.getElementById('datasetLoadStatus');
    if (statusEl) {
        statusEl.innerHTML = type === 'error' ? `❌ ${message}` : `ℹ️ ${message}`;
        statusEl.className = `dataset-status ${type}`;
    }
}

// Initialize when DOM is ready (after main app.js)
document.addEventListener('DOMContentLoaded', () => {
    // Delay to ensure main app initializes first
    setTimeout(() => {
        initProblemSwitcher();
    }, 100);
});
