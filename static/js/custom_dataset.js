/**
 * Custom Dataset & Prediction Module
 * AIoT HW2 - Multiple Linear Regression (OLS)
 *
 * Provides:
 *   1. Dataset loading: Quick presets, arbitrary CSV URL (with proxy fallback),
 *      local CSV file upload, or direct CSV text paste.
 *   2. Client-side Multiple Linear Regression (OLS) training via Normal Equation:
 *      β = (X'X)^(-1) X'y with L2 regularization for stability.
 *   3. Metrics: Train R², Test R², Adjusted R², RMSE, MAE.
 *   4. 【填入自訂資料做預測】:
 *      Interactive feature input form (typing numbers / adjusting sliders),
 *      calculating point prediction y_hat, 95% Confidence Interval (CI),
 *      95% Prediction Interval (PI), leverage h_0, standard errors, and feature contributions.
 *   5. 【產出圖片在網站上】:
 *      - 6 interactive Chart.js visualizations (including custom prediction CI/PI error bar
 *        distribution chart & feature attribution waterfall chart).
 *      - Live high-resolution report image generation rendered directly into an <img> on the site,
 *        with 1-click PNG download!
 */

// ============================================================
// Embedded Sample Datasets for 100% Offline / Local Reliability
// ============================================================
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

const LOCAL_INSURANCE_CSV = `age,bmi,children,smoker,charges
19,27.9,0,1,16884.92
18,33.77,1,0,1725.55
28,33,3,0,4449.46
33,22.7,0,0,21984.47
32,28.88,0,0,3866.86
31,25.74,0,0,3756.62
46,33.44,1,0,8240.59
37,27.74,3,0,7281.51
60,25.84,0,0,28923.14
25,26.22,0,0,2721.32
62,26.29,0,1,27808.73
23,34.4,0,0,1826.84
56,39.82,0,0,11090.72
27,42.13,0,1,39611.76
19,24.6,1,0,1837.24
52,30.78,1,0,10797.34
23,23.85,5,0,2395.17
56,40.3,0,0,10602.39
30,35.3,0,1,36837.47
18,38.28,0,0,1631.82
34,31.92,1,1,37701.88
37,28.03,2,0,6203.9
59,31.92,1,0,11799.55
42,24.86,0,0,6940.91
30,28.4,1,0,4151.03
55,32.78,0,0,10226.28
23,17.38,1,0,2775.19
31,36.3,2,1,38711.0
22,35.6,0,1,35585.58
41,21.75,1,0,6710.19
49,30.4,1,1,39722.75
35,34.77,2,0,5729.01
45,28.7,0,0,7731.43
38,31,1,0,5488.19
61,36.3,1,1,47496.49`;

const LOCAL_WINE_CSV = `fixed_acidity,volatile_acidity,citric_acid,residual_sugar,chlorides,free_sulfur_dioxide,total_sulfur_dioxide,density,pH,sulphates,alcohol,quality
7.4,0.7,0,1.9,0.076,11,34,0.9978,3.51,0.56,9.4,5
7.8,0.88,0,2.6,0.098,25,67,0.9968,3.2,0.68,9.8,5
7.8,0.76,0.04,2.3,0.092,15,54,0.997,3.26,0.65,9.8,5
11.2,0.28,0.56,1.9,0.075,17,60,0.998,3.16,0.58,9.8,6
7.4,0.7,0,1.9,0.076,11,34,0.9978,3.51,0.56,9.4,5
7.4,0.66,0,1.8,0.075,13,40,0.9978,3.51,0.56,9.4,5
7.9,0.6,0.06,1.6,0.069,15,59,0.9964,3.3,0.46,9.4,5
7.3,0.65,0,1.2,0.065,15,21,0.9946,3.39,0.47,10,7
7.8,0.58,0.02,2,0.073,9,18,0.9968,3.36,0.57,9.5,7
7.5,0.5,0.36,6.1,0.071,17,102,0.9978,3.35,0.8,10.5,5
6.7,0.58,0.08,1.8,0.097,15,65,0.9959,3.28,0.54,9.2,5
7.5,0.5,0.36,6.1,0.071,17,102,0.9978,3.35,0.8,10.5,5
5.6,0.615,0,1.6,0.089,16,59,0.9943,3.58,0.52,9.9,5
7.8,0.61,0.29,1.6,0.114,9,48,0.9974,3.26,1.56,9.1,5
8.9,0.62,0.18,3.8,0.176,52,145,0.9986,3.16,0.88,9.2,5
8.9,0.62,0.19,3.9,0.17,51,148,0.9986,3.17,0.93,9.2,5
8.5,0.28,0.56,1.8,0.092,35,103,0.9969,3.3,0.75,10.5,7
8.1,0.56,0.28,1.7,0.368,16,56,0.9968,3.11,1.28,9.3,5
7.4,0.59,0.08,4.4,0.086,6,29,0.9974,3.38,0.5,9,5
7.9,0.32,0.51,1.8,0.341,17,56,0.9969,3.04,1.08,9.2,6
8.9,0.22,0.48,1.8,0.077,29,60,0.9968,3.39,0.53,9.4,6
7.6,0.39,0.31,2.3,0.082,23,71,0.9982,3.52,0.65,9.7,5
7.9,0.43,0.32,1.6,0.106,10,37,0.9966,3.17,0.91,9.5,5
8.5,0.49,0.11,2.3,0.084,9,67,0.9968,3.17,0.53,9.4,5
6.9,0.4,0.14,2.4,0.085,21,40,0.9968,3.43,0.63,9.7,6
6.3,0.39,0.16,1.4,0.08,11,23,0.9955,3.34,0.56,9.3,5
7.6,0.41,0.24,1.8,0.08,4,11,0.9962,3.28,0.59,9.5,5
7.9,0.43,0.32,1.6,0.106,10,37,0.9966,3.17,0.91,9.5,5
7.1,0.71,0,1.9,0.08,14,35,0.9972,3.47,0.55,9.4,5
7.8,0.645,0,2,0.082,8,16,0.9964,3.38,0.59,9.8,6`;

const LOCAL_FLOOD_SAMPLE_CSV = `MonsoonIntensity,TopographyDrainage,RiverManagement,Deforestation,Urbanization,ClimateChange,DamsQuality,Siltation,AgriculturalPractices,Encroachments,IneffectiveDisasterPreparedness,DrainageSystems,CoastalVulnerability,Landslides,Watersheds,DeterioratingInfrastructure,PopulationScore,WetlandLoss,InadequatePlanning,PoliticalFactors,FloodProbability
5,4,5,8,7,5,3,6,3,3,0,5,2,4,5,6,6,5,5,9,0.479
3,3,5,2,5,3,5,3,5,4,4,9,6,6,4,1,5,6,4,6,0.434
4,8,6,3,6,2,2,8,7,7,7,2,2,2,3,9,3,6,2,4,0.445
5,0,3,6,2,2,1,10,6,8,5,1,2,1,10,4,5,3,3,7,0.405
5,4,9,5,6,3,2,4,9,9,7,2,5,6,5,3,3,5,7,8,0.519
3,2,4,3,8,1,7,4,5,6,4,4,7,5,7,5,5,7,4,9,0.438
5,7,9,6,4,4,6,2,3,7,4,6,6,4,7,2,4,5,6,3,0.477
4,2,5,6,4,10,2,3,5,8,4,5,6,1,0,3,6,7,4,3,0.442
6,4,5,7,5,10,8,5,5,4,6,3,3,3,3,6,7,1,3,6,0.516
7,5,7,2,3,3,9,3,10,3,8,4,5,3,6,7,4,7,7,6,0.556
2,7,6,1,5,6,4,4,4,5,5,6,3,6,5,3,5,8,3,5,0.488
5,1,5,2,7,5,6,8,7,6,5,4,7,1,5,9,2,3,6,6,0.539
5,5,2,4,5,3,6,1,5,2,3,3,5,6,5,2,4,5,5,4,0.398
6,5,10,6,6,8,3,8,9,3,3,3,4,3,5,6,4,6,8,5,0.535
4,1,6,5,11,6,3,5,9,4,6,2,6,5,3,7,5,7,2,6,0.538
5,4,1,5,3,1,8,2,2,7,6,7,5,6,5,5,4,3,4,2,0.402
7,2,5,5,5,6,4,10,3,1,1,8,6,5,7,5,7,1,3,7,0.488
1,7,3,6,5,8,4,1,7,4,2,6,3,4,5,6,8,3,6,6,0.461
6,3,5,6,2,3,5,9,5,5,5,6,3,5,6,6,6,3,9,6,0.526
2,6,3,3,8,6,11,2,1,5,3,8,5,9,4,6,3,3,6,3,0.496
8,4,3,6,10,2,2,8,7,7,5,5,3,5,4,6,8,4,1,4,0.495
4,4,3,4,4,3,1,2,5,7,3,4,5,11,4,3,5,4,2,10,0.429
3,9,3,6,2,7,5,7,7,3,3,3,4,2,8,5,6,7,10,6,0.528
3,11,4,7,6,4,2,2,3,6,3,4,3,5,3,8,9,3,3,3,0.468
6,3,2,6,5,2,2,4,6,4,4,7,6,5,5,5,6,6,5,4,0.467
4,5,4,3,6,5,3,6,5,7,6,4,4,6,4,4,3,5,3,4,0.457
5,6,6,7,2,5,4,4,6,4,6,5,6,5,4,7,3,4,7,6,0.518
3,3,5,4,3,7,4,5,8,7,3,5,6,4,4,6,5,4,4,3,0.462
5,4,8,8,6,3,7,4,6,8,4,4,3,3,8,7,5,4,3,5,0.524
6,4,4,5,6,3,5,4,5,6,3,5,5,8,4,4,5,5,8,4,0.491`;

// ============================================================
// State
// ============================================================
let customDatasetState = {
    datasetName: '50 Startups Profit Dataset',
    rawData: '',
    parsedData: null,
    features: [],
    target: '',
    trainX: null,
    trainY: null,
    testX: null,
    testY: null,
    model: null,
    metrics: null,
    intervals: null,
    featureStats: {},      // { [feat]: { mean, min, max, std } }
    customInputs: {},      // { [feat]: number }
    currentPrediction: null,
    charts: {},
    isInitialized: false
};

// ============================================================
// Initialization & Entry Points
// ============================================================
function initCustomDatasetModule() {
    // Listen for file upload
    const fileInput = document.getElementById('customCsvFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    loadCustomCsvText(evt.target.result, undefined, `📁 上傳檔案: ${file.name}`);
                };
                reader.readAsText(file);
            }
        });
    }

    // Auto-init with 50 Startups when user visits tab-custom
    const customTabBtn = document.querySelector('.nav-tab[data-tab="tab-custom"]');
    if (customTabBtn) {
        customTabBtn.addEventListener('click', () => {
            window.ensureCustomDatasetInitialized();
        });
    }
}

window.ensureCustomDatasetInitialized = function() {
    if (!customDatasetState.isInitialized) {
        // Automatically preload 50 Startups for immediate readiness
        loadCustomCsvText(LOCAL_50_STARTUPS_CSV, 'Profit', '💰 50 Startups 經典資料集');
        customDatasetState.isInitialized = true;
    }
};

// ============================================================
// Data Loading Functions
// ============================================================
function setCustomLoadStatus(html, statusClass, percent) {
    const el = document.getElementById('datasetLoadStatusInline');
    const bar = document.getElementById('loadProgressBarInline');
    if (el) {
        el.innerHTML = html;
        el.className = `dataset-status ${statusClass}`;
    }
    if (bar) {
        bar.style.width = `${percent}%`;
    }
}

async function loadCustomDataset(url, presetTarget) {
    setCustomLoadStatus('<span class="loading-spinner"></span> 正在載入遠端資料集...', 'loading', 30);

    try {
        let csvText = '';
        let sourceName = '遠端 CSV';

        // Check if matching preset
        if (url.includes('50_Startups')) {
            csvText = LOCAL_50_STARTUPS_CSV;
            sourceName = '💰 50 Startups 資料集';
        } else if (url.includes('insurance')) {
            csvText = LOCAL_INSURANCE_CSV;
            sourceName = '🏥 Medical Insurance 資料集';
        } else if (url.includes('winequality')) {
            csvText = LOCAL_WINE_CSV;
            sourceName = '🍷 Wine Quality 資料集';
        } else if (url.includes('flood') || url.includes('s4e5')) {
            csvText = LOCAL_FLOOD_SAMPLE_CSV;
            sourceName = '🌊 Kaggle Flood Risk 資料集';
        } else {
            // Direct fetch
            try {
                const response = await fetch(url);
                if (response.ok) {
                    csvText = await response.text();
                    sourceName = url.split('/').pop() || '自訂 CSV';
                }
            } catch (netErr) {
                console.warn('Direct fetch failed, trying proxy...', netErr);
            }

            // Proxy fallback
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
            throw new Error('無法取得 CSV 內容，請檢查網址或嘗試直接上傳本機 CSV 檔案。');
        }

        loadCustomCsvText(csvText, presetTarget, sourceName);

    } catch (err) {
        console.error('Dataset load error:', err);
        setCustomLoadStatus(`❌ 載入失敗: ${err.message}`, 'error', 0);
    }
}

function loadCustomCsvText(csvText, presetTarget, sourceName) {
    setCustomLoadStatus('正在解析 CSV 欄位與結構...', 'loading', 65);

    try {
        const parsed = Papa.parse(csvText.trim(), {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        if (parsed.errors.length > 0 && parsed.data.length === 0) {
            throw new Error('CSV 解析失敗: ' + parsed.errors[0].message);
        }

        customDatasetState.rawData = csvText;
        customDatasetState.parsedData = parsed.data;
        customDatasetState.datasetName = sourceName || '自訂資料集';

        // Update target column selectors
        populateTargetColumnSelect(parsed.meta.fields, presetTarget);

        setCustomLoadStatus('正在擬合 OLS 多元回歸模型與計算統計信賴區間...', 'loading', 85);

        // Run regression analysis
        runCustomAnalysis();

        setCustomLoadStatus(`✅ 成功載入【${customDatasetState.datasetName}】(${parsed.data.length} 筆資料、${parsed.meta.fields.length} 個欄位)，已完成模型訓練與自訂預測介面生成！`, 'success', 100);

        if (typeof window.switchTab === 'function') {
            window.switchTab('tab-custom');
        }

    } catch (err) {
        console.error('Parse or regression error:', err);
        setCustomLoadStatus(`❌ 處理失敗: ${err.message}`, 'error', 0);
    }
}

function populateTargetColumnSelect(fields, presetTarget) {
    const select = document.getElementById('targetColumnSelectInline');
    if (!select) return;

    select.innerHTML = '';
    fields.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = `🎯 目標: ${f}`;
        if (presetTarget && f === presetTarget) opt.selected = true;
        select.appendChild(opt);
    });

    if (!presetTarget) {
        if (fields.includes('Profit')) select.value = 'Profit';
        else if (fields.includes('charges')) select.value = 'charges';
        else if (fields.includes('quality')) select.value = 'quality';
        else if (fields.includes('FloodProbability')) select.value = 'FloodProbability';
        else select.value = fields[fields.length - 1];
    }

    select.onchange = () => {
        runCustomAnalysis();
    };
}

// Quick-load helper
window.quickLoadDataset = function(url, target) {
    const urlInput = document.getElementById('customDatasetUrlInline');
    if (urlInput) urlInput.value = url;
    loadCustomDataset(url, target);
};

window.loadFromInlineInput = function() {
    const url = document.getElementById('customDatasetUrlInline')?.value?.trim();
    const target = document.getElementById('targetColumnSelectInline')?.value || undefined;
    if (!url) {
        alert('請輸入有效的 CSV URL 或點擊上方的快速載入範例按鈕！');
        return;
    }
    loadCustomDataset(url, target);
};

window.loadFromPastedText = function() {
    const textarea = document.getElementById('customCsvTextarea');
    const text = textarea?.value?.trim();
    if (!text) {
        alert('請先在文字框中貼上 CSV 內容（需含表頭欄位名稱）！');
        return;
    }
    loadCustomCsvText(text, undefined, '📝 剪貼簿貼上 CSV');
};

// ============================================================
// Client-Side OLS Multiple Linear Regression Engine
// ============================================================
function runCustomAnalysis() {
    const data = customDatasetState.parsedData;
    if (!data || data.length === 0) return;

    const targetSelect = document.getElementById('targetColumnSelectInline');
    let targetCol = targetSelect?.value;
    if (!targetCol && data[0]) {
        const keys = Object.keys(data[0]);
        targetCol = keys.includes('Profit') ? 'Profit' : keys[keys.length - 1];
    }
    if (!targetCol) return;

    // Detect numeric vs categorical columns
    const allCols = Object.keys(data[0]);
    const numericCols = allCols.filter(col => {
        if (col === targetCol) return false;
        let numCount = 0;
        const sampleSize = Math.min(data.length, 50);
        for (let i = 0; i < sampleSize; i++) {
            if (typeof data[i][col] === 'number' && !isNaN(data[i][col])) numCount++;
        }
        return numCount / sampleSize > 0.8;
    });

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

    // Build feature list and one-hot encoding
    let featureNames = [...numericCols];
    let encodedData = data.map(row => {
        const encoded = {};
        numericCols.forEach(col => {
            encoded[col] = typeof row[col] === 'number' ? row[col] : (parseFloat(row[col]) || 0);
        });
        encoded[targetCol] = typeof row[targetCol] === 'number' ? row[targetCol] : (parseFloat(row[targetCol]) || 0);
        return encoded;
    });

    // One-hot encode categoricals
    const categoryMaps = {};
    categoricalCols.forEach(col => {
        const uniqueVals = [...new Set(data.map(r => r[col]).filter(v => v != null))];
        categoryMaps[col] = uniqueVals;
        // Skip first category as reference
        uniqueVals.slice(1).forEach(val => {
            const featureName = `${col}_${val}`;
            featureNames.push(featureName);
            encodedData.forEach((row, i) => {
                row[featureName] = data[i][col] === val ? 1 : 0;
            });
        });
    });

    // Filter out rows with NaN
    encodedData = encodedData.filter(row => !isNaN(row[targetCol]) && row[targetCol] !== null);

    if (encodedData.length < 5) {
        alert('有效資料筆數不足 (至少需 5 筆)');
        return;
    }

    // Limit features to 39 if exceeds (assignment rule: < 40 features)
    if (featureNames.length > 39) {
        featureNames = selectTopFeaturesByCorrelation(encodedData, featureNames, targetCol, 39);
    }

    // Compute feature statistics (mean, min, max, std)
    const stats = {};
    featureNames.forEach(f => {
        const vals = encodedData.map(r => r[f]);
        const sum = vals.reduce((a, b) => a + b, 0);
        const mean = sum / vals.length;
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
        stats[f] = {
            mean,
            min,
            max,
            std: Math.sqrt(variance) || 1.0
        };
    });

    customDatasetState.featureStats = stats;
    customDatasetState.features = featureNames;
    customDatasetState.target = targetCol;

    // Default custom inputs to feature means
    const defaultInputs = {};
    featureNames.forEach(f => {
        defaultInputs[f] = Math.round(stats[f].mean * 100) / 100;
    });
    customDatasetState.customInputs = defaultInputs;

    // Train/Test split (80/20, deterministic seed)
    const splitIdx = Math.max(1, Math.floor(encodedData.length * 0.8));
    const shuffled = seededShuffle(encodedData, 42);
    const trainData = shuffled.slice(0, splitIdx);
    const testData = shuffled.slice(splitIdx);

    const trainX = trainData.map(row => featureNames.map(f => row[f] || 0));
    const trainY = trainData.map(row => row[targetCol]);
    const testX = (testData.length > 0 ? testData : trainData).map(row => featureNames.map(f => row[f] || 0));
    const testY = (testData.length > 0 ? testData : trainData).map(row => row[targetCol]);

    customDatasetState.trainX = trainX;
    customDatasetState.trainY = trainY;
    customDatasetState.testX = testX;
    customDatasetState.testY = testY;

    // Fit OLS
    const model = fitOLS(trainX, trainY);
    customDatasetState.model = model;

    // In-sample and out-of-sample predictions
    const trainPred = predictOLS(model, trainX);
    const testPred = predictOLS(model, testX);

    // Metrics
    const metrics = computeMetrics(trainY, trainPred, testY, testPred, featureNames.length);
    customDatasetState.metrics = metrics;

    // Confidence & Prediction Intervals for test set
    const intervals = computeIntervals(model, testX, testY, testPred);
    customDatasetState.intervals = intervals;

    // Residuals
    const testResiduals = testY.map((y, i) => y - testPred[i]);

    // Initial custom prediction for the default inputs
    const initialCustomPred = calculateSinglePrediction(model, defaultInputs, featureNames, stats);
    customDatasetState.currentPrediction = initialCustomPred;

    // Render Full UI
    renderCustomResultsUI({
        datasetName: customDatasetState.datasetName,
        featureNames,
        targetCol,
        model,
        metrics,
        intervals,
        testY,
        testPred,
        testResiduals,
        stats,
        currentPred: initialCustomPred
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
// OLS Fitting via Normal Equation: β = (X'X)^(-1) X'y
// ============================================================
function fitOLS(X, y) {
    const n = X.length;
    const p = X[0].length;
    const pAug = p + 1;

    // Augment X with constant 1.0 for intercept
    const Xa = X.map(row => [1, ...row]);

    // X'X
    const XtX = Array.from({ length: pAug }, () => new Float64Array(pAug));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < pAug; j++) {
            for (let k = j; k < pAug; k++) {
                XtX[j][k] += Xa[i][j] * Xa[i][k];
            }
        }
    }
    for (let j = 0; j < pAug; j++) {
        for (let k = 0; k < j; k++) {
            XtX[j][k] = XtX[k][j];
        }
    }

    // X'y
    const Xty = new Float64Array(pAug);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < pAug; j++) {
            Xty[j] += Xa[i][j] * y[i];
        }
    }

    // Solve via Inversion with slight ridge stabilization
    const XtX_inv = invertMatrixWithRidge(XtX, pAug, 1e-7);

    // β = (X'X)^(-1) X'y
    const beta = new Float64Array(pAug);
    for (let j = 0; j < pAug; j++) {
        for (let k = 0; k < pAug; k++) {
            beta[j] += XtX_inv[j][k] * Xty[k];
        }
    }

    // Residual standard deviation
    let sse = 0;
    for (let i = 0; i < n; i++) {
        let yhat = 0;
        for (let j = 0; j < pAug; j++) yhat += Xa[i][j] * beta[j];
        sse += (y[i] - yhat) ** 2;
    }
    const df = Math.max(1, n - pAug);
    const residualStd = Math.sqrt(sse / df);

    return {
        intercept: beta[0],
        coefficients: Array.from(beta.slice(1)),
        XtX_inv: XtX_inv.map(row => Array.from(row)),
        residualStd,
        n,
        p: pAug,
        df,
        sse
    };
}

function invertMatrixWithRidge(mat, n, ridgeLambda) {
    const aug = Array.from({ length: n }, (_, i) => {
        const row = new Float64Array(2 * n);
        for (let j = 0; j < n; j++) row[j] = mat[i][j];
        // Ridge diagonal
        row[i] += ridgeLambda;
        row[n + i] = 1;
        return row;
    });

    for (let col = 0; col < n; col++) {
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
        }
        [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

        const pivot = aug[col][col];
        const pivSafe = Math.abs(pivot) < 1e-12 ? 1e-8 : pivot;
        for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivSafe;

        for (let row = 0; row < n; row++) {
            if (row === col) continue;
            const factor = aug[row][col];
            for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j];
        }
    }

    return aug.map(row => Array.from(row.slice(n)));
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

function computeMetrics(trainY, trainPred, testY, testPred, numFeatures) {
    const trainR2 = rSquared(trainY, trainPred);
    const testR2 = rSquared(testY, testPred);
    const n = testY.length;
    const p = numFeatures;
    const adjR2 = (n - p - 1 > 0) ? 1 - (1 - testR2) * (n - 1) / (n - p - 1) : testR2;

    return {
        trainR2,
        testR2,
        adjR2,
        testRMSE: rmse(testY, testPred),
        testMAE: mae(testY, testPred),
        trainSamples: trainY.length,
        testSamples: testY.length,
        numFeatures
    };
}

function rSquared(actual, predicted) {
    const mean = actual.reduce((s, v) => s + v, 0) / actual.length;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < actual.length; i++) {
        ssTot += (actual[i] - mean) ** 2;
        ssRes += (actual[i] - predicted[i]) ** 2;
    }
    return ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
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

function computeIntervals(model, testX, testY, testPred) {
    const t_crit = 1.96;
    const s = model.residualStd;
    const XtX_inv = model.XtX_inv;

    return testPred.map((yhat, idx) => {
        const x = [1, ...testX[idx]];
        const p = x.length;

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
            sePred,
            leverage
        };
    });
}

// ============================================================
// Single Instance Custom Prediction Logic
// ============================================================
function calculateSinglePrediction(model, inputs, featureNames, stats) {
    const xVec = featureNames.map(f => {
        const v = inputs[f];
        return (typeof v === 'number' && !isNaN(v)) ? v : (stats[f] ? stats[f].mean : 0);
    });

    // Augment with constant 1.0 for intercept
    const xAug = [1.0, ...xVec];
    const pAug = xAug.length;

    // Point Prediction y_hat = beta_0 + sum(beta_i * x_i)
    let yHat = model.intercept;
    for (let i = 0; i < xVec.length; i++) {
        yHat += xVec[i] * model.coefficients[i];
    }

    // Leverage h_0 = x_aug' (X'X)^(-1) x_aug
    let leverage = 0;
    for (let r = 0; r < pAug; r++) {
        let dot = 0;
        for (let c = 0; c < pAug; c++) {
            dot += model.XtX_inv[r][c] * xAug[c];
        }
        leverage += xAug[r] * dot;
    }
    leverage = Math.max(0, leverage);

    const s = model.residualStd;
    const t_crit = 1.96; // 95% critical value
    const seMean = Math.sqrt(s * s * leverage);
    const sePred = Math.sqrt(s * s * (1.0 + leverage));

    const ciLow = yHat - t_crit * seMean;
    const ciHigh = yHat + t_crit * seMean;
    const piLow = yHat - t_crit * sePred;
    const piHigh = yHat + t_crit * sePred;

    // Feature contributions relative to baseline mean
    const contributions = featureNames.map((f, i) => {
        const val = xVec[i];
        const mean = stats[f] ? stats[f].mean : 0;
        const diff = val - mean;
        const contrib = model.coefficients[i] * diff;
        return {
            feature: f,
            value: val,
            mean,
            diff,
            coef: model.coefficients[i],
            contribution: contrib,
            direction: contrib >= 0 ? 'positive' : 'negative'
        };
    });

    // Sort contributions by absolute value
    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return {
        yHat,
        ciLow,
        ciHigh,
        piLow,
        piHigh,
        ciWidth: ciHigh - ciLow,
        piWidth: piHigh - piLow,
        leverage,
        seMean,
        sePred,
        s,
        contributions,
        inputs: { ...inputs }
    };
}

// ============================================================
// UI Rendering: Results, Inputs & Visualizations
// ============================================================
function renderCustomResultsUI(data) {
    const container = document.getElementById('customResultsContainer');
    if (!container) return;

    const { datasetName, featureNames, targetCol, model, metrics, intervals,
            testY, testPred, testResiduals, stats, currentPred } = data;

    const sortedIntervals = [...intervals].sort((a, b) => a.predicted - b.predicted);

    container.innerHTML = `
        <!-- Model Summary & Evaluation Card -->
        <div class="glass-card mb-4 dataset-summary-card">
            <div class="custom-section-badge">
                <span class="badge badge-accent">📊 模型訓練完成</span>
                <span class="badge badge-purple">${datasetName}</span>
                <span class="badge badge-success">目標變數: ${targetCol}</span>
            </div>

            <div class="summary-grid mt-3">
                <div class="summary-stat">
                    <div class="stat-value">${metrics.trainSamples + metrics.testSamples}</div>
                    <div class="stat-label">總樣本數</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${metrics.numFeatures}</div>
                    <div class="stat-label">特徵維度 (P)</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${metrics.trainR2.toFixed(4)}</div>
                    <div class="stat-label">Train R²</div>
                </div>
                <div class="summary-stat highlight-stat">
                    <div class="stat-value text-accent">${metrics.testR2.toFixed(4)}</div>
                    <div class="stat-label">Test R² (測試集決定係數)</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${metrics.adjR2.toFixed(4)}</div>
                    <div class="stat-label">Adjusted R²</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${metrics.testRMSE.toFixed(4)}</div>
                    <div class="stat-label">RMSE (均方根誤差)</div>
                </div>
            </div>

            <!-- Algebraic Equation -->
            <div class="equation-box mt-3">
                <div class="equation-label">📐 多元線性回歸方程式 (OLS Equation)：</div>
                <code class="equation-code">${targetCol} = ${model.intercept.toFixed(4)}${featureNames.map((f, i) => ` ${model.coefficients[i] >= 0 ? '+' : ''}${model.coefficients[i].toFixed(4)} × ${f}`).join('')}</code>
            </div>
        </div>

        <!-- ★ CORE SECTION: 填入自訂資料做預測 ★ -->
        <div class="glass-card mb-4 custom-predict-hero-card" id="customPredictionSection">
            <div class="custom-card-header">
                <div>
                    <h3 class="card-title text-gradient">🎛️ 填入自訂資料進行即時預測 (Custom Feature Inputs & Prediction)</h3>
                    <p class="card-desc">
                        在下方調整或直接輸入特徵數值，系統將套用回歸方程式即時計算<b>點預測值</b>、<b>95% 信賴區間 (CI)</b>、<b>95% 預測區間 (PI)</b> 與<b>特徵邊際貢獻</b>。
                    </p>
                </div>
                <div class="custom-predict-quick-btns">
                    <button class="btn-preset btn-preset-sm" onclick="fillCustomInputsWithSample()">🎲 載入測試樣本</button>
                    <button class="btn-preset btn-preset-sm" onclick="fillCustomInputsWithMeans()">📊 填入特徵平均值</button>
                    <button class="btn-preset btn-preset-sm btn-reset" onclick="resetCustomInputsToZero()">🧹 清空為 0</button>
                </div>
            </div>

            <!-- Feature Inputs Grid -->
            <div class="custom-inputs-wrapper mt-3">
                <div class="custom-inputs-grid" id="customFeatureInputsGrid">
                    ${featureNames.map(f => {
                        const st = stats[f] || { mean: 0, min: 0, max: 100 };
                        const curVal = customDatasetState.customInputs[f] !== undefined ? customDatasetState.customInputs[f] : Math.round(st.mean * 100) / 100;
                        const minVal = Math.min(st.min, curVal);
                        const maxVal = Math.max(st.max, curVal + 1);
                        const stepVal = (maxVal - minVal) > 100 ? 1 : 0.01;

                        return `
                            <div class="feature-input-card">
                                <div class="feature-input-header">
                                    <span class="feature-name" title="${f}">${f}</span>
                                    <span class="feature-baseline-tag">均值: ${st.mean.toFixed(2)}</span>
                                </div>
                                <div class="feature-input-control">
                                    <input type="number" class="styled-number-input" id="num-${f}" 
                                           step="${stepVal}" value="${curVal}" 
                                           oninput="handleCustomFeatureChange('${f}', this.value)">
                                </div>
                                <div class="feature-slider-control">
                                    <input type="range" class="styled-range styled-range-sm" id="rng-${f}" 
                                           min="${minVal}" max="${maxVal}" step="${stepVal}" value="${curVal}"
                                           oninput="handleCustomFeatureChange('${f}', this.value)">
                                </div>
                                <div class="feature-range-hints">
                                    <span>min: ${st.min.toFixed(1)}</span>
                                    <span>max: ${st.max.toFixed(1)}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Predict Action Button -->
            <div class="predict-action-bar mt-3">
                <button class="btn-primary-glow" onclick="executeCustomPrediction()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    ⚡ 立即計算自訂預測 (Calculate Prediction)
                </button>
                <button class="btn-secondary-glow" onclick="generateAndDisplayReportImage()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    📸 產出預測視覺化圖檔在網站上
                </button>
            </div>

            <!-- Prediction Results Display Box -->
            <div class="custom-pred-result-card mt-4" id="customPredictionResultCard">
                ${renderPredictionCardHtml(targetCol, currentPred)}
            </div>
        </div>

        <!-- ★ IMAGE GENERATION PREVIEW CARD (產出圖片在網站上) ★ -->
        <div class="glass-card mb-4 generated-image-showcase-card" id="generatedImageSection">
            <div class="custom-card-header">
                <div>
                    <h3 class="card-title text-gradient">🖼️ 網站即時產出之預測分析圖檔 (Live Generated Image)</h3>
                    <p class="card-desc">
                        系統將自訂預測數值、95% CI/PI 區間定位與特徵貢獻圖表<b>即時渲染產出為 PNG 圖片</b>，已呈現在下方，可直接右鍵另存或點擊下載。
                    </p>
                </div>
                <div>
                    <a id="btnDownloadReportImage" class="btn-download-action" download="custom_prediction_report.png" href="#">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        💾 下載 PNG 圖檔
                    </a>
                </div>
            </div>

            <div class="generated-image-container mt-3" id="generatedImageContainer">
                <img id="customGeneratedImage" class="custom-rendered-image" alt="自訂預測分析圖檔" src="" style="display: none;">
                <div id="imageGeneratingSpinner" class="image-spinner-wrapper">
                    <span class="loading-spinner"></span> 正在即時繪製高解析度預測圖檔...
                </div>
            </div>
        </div>

        <!-- Dynamic Visualizations Grid -->
        <div class="custom-charts-grid">
            <!-- 1. Custom Prediction Point with CI & PI Error Bars -->
            <div class="glass-card plot-card">
                <div class="plot-card-header">
                    <div>
                        <h3 class="plot-title">🎯 自訂預測點與 95% CI / PI 區間定位圖</h3>
                        <p class="plot-desc">高亮標記您的自訂預測點，並繪出母體均值信賴區間 (CI) 與單一預測區間 (PI)</p>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="customPredictionPointChart"></canvas>
                </div>
            </div>

            <!-- 2. Feature Contributions to this Prediction -->
            <div class="glass-card plot-card">
                <div class="plot-card-header">
                    <div>
                        <h3 class="plot-title">📊 自訂輸入各特徵之邊際貢獻度</h3>
                        <p class="plot-desc">相較於歷史平均值基準，各項輸入數值所帶動的正向拉抬 (+) 或負向抑制 (-)</p>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="customContributionChart"></canvas>
                </div>
            </div>

            <!-- 3. Actual vs Predicted with CI/PI Ribbon -->
            <div class="glass-card plot-card">
                <div class="plot-card-header">
                    <div>
                        <h3 class="plot-title">📈 測試集觀測值 vs 回歸擬合線 (含 CI & PI 帶狀區)</h3>
                        <p class="plot-desc">紅點為測試集樣本；天藍線為 OLS 擬合；藍色帶為 95% CI；灰色帶為 95% PI</p>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="customActualVsPredChart"></canvas>
                </div>
            </div>

            <!-- 4. Residual Diagnostics -->
            <div class="glass-card plot-card">
                <div class="plot-card-header">
                    <div>
                        <h3 class="plot-title">🔬 殘差 vs 預測值散佈圖 (Residual Diagnostics)</h3>
                        <p class="plot-desc">檢定同質變異性 (Homoscedasticity) 與線性關係假設</p>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="customResidualChart"></canvas>
                </div>
            </div>

            <!-- 5. Feature Coefficients -->
            <div class="glass-card plot-card">
                <div class="plot-card-header">
                    <div>
                        <h3 class="plot-title">⚖️ 特徵回歸係數 (Feature Coefficients β)</h3>
                        <p class="plot-desc">各特徵在多元線性回歸模型中的權重係數大小與影響方向</p>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="customCoefChart"></canvas>
                </div>
            </div>

            <!-- 6. Residual Histogram -->
            <div class="glass-card plot-card">
                <div class="plot-card-header">
                    <div>
                        <h3 class="plot-title">📉 殘差常態分布直方圖 (Residual Distribution)</h3>
                        <p class="plot-desc">檢驗誤差項是否服從常態分配 (Normal Distribution)</p>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="customResidualHistChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Coefficients Detail Table -->
        <div class="glass-card mb-4">
            <h3 class="card-title">📋 特徵回歸係數排行榜 (Feature Coefficients Ranking)</h3>
            <div class="assumptions-table-wrapper">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>特徵名稱</th>
                            <th>回歸係數 (β)</th>
                            <th>影響強度 (|β|)</th>
                            <th>資料集均值</th>
                            <th>當前自訂輸入值</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${featureNames
                            .map((f, i) => ({ 
                                name: f, 
                                coef: model.coefficients[i], 
                                mean: stats[f] ? stats[f].mean : 0,
                                inputVal: customDatasetState.customInputs[f]
                            }))
                            .sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef))
                            .map((item, idx) => `
                                <tr${idx === 0 ? ' class="highlight-row"' : ''}>
                                    <td>${idx + 1}</td>
                                    <td><b>${item.name}</b></td>
                                    <td><code>${item.coef >= 0 ? '+' : ''}${item.coef.toFixed(6)}</code></td>
                                    <td><code>${Math.abs(item.coef).toFixed(6)}</code></td>
                                    <td>${item.mean.toFixed(2)}</td>
                                    <td><b class="text-accent">${(item.inputVal !== undefined ? item.inputVal : item.mean).toFixed(2)}</b></td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Render Chart.js charts
    requestAnimationFrame(() => {
        renderCustomPredictionPointChart(currentPred, targetCol);
        renderCustomContributionChart(currentPred.contributions);
        renderActualVsPredChart(sortedIntervals);
        renderResidualChart(testPred, testResiduals);
        renderCoefChart(featureNames, model.coefficients);
        renderResidualHistChart(testResiduals);

        // Automatically generate report image to display on the website
        setTimeout(() => {
            generateAndDisplayReportImage();
        }, 200);
    });
}

function renderPredictionCardHtml(targetCol, pred) {
    if (!pred) return '';

    const formatVal = (v) => {
        if (Math.abs(v) > 1000) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return v.toFixed(4);
    };

    return `
        <div class="pred-result-header">
            <div class="pred-title-group">
                <span class="pred-badge-glow">🚀 即時多元回歸推論</span>
                <h4 class="pred-target-title">預測目標：【${targetCol}】</h4>
            </div>
            <div class="pred-leverage-tag">
                槓桿值 h₀ = <code>${pred.leverage.toFixed(5)}</code> 
                (${pred.leverage > 0.5 ? '⚠️ 遠離資料中心' : '✅ 位於樣本有效信賴域'})
            </div>
        </div>

        <div class="pred-main-metric-row">
            <div class="pred-point-box">
                <div class="pred-box-label">點預測值 (Point Prediction ŷ)</div>
                <div class="pred-point-number">${formatVal(pred.yHat)}</div>
                <div class="pred-box-sub">由 OLS 線性矩陣方程式推算</div>
            </div>

            <div class="pred-interval-box ci-box">
                <div class="interval-tag ci-tag">95% 信賴區間 (CI for Mean)</div>
                <div class="interval-range-text">[${formatVal(pred.ciLow)}, ${formatVal(pred.ciHigh)}]</div>
                <div class="interval-width-text">區間寬度 Δ = ${formatVal(pred.ciWidth)}</div>
                <div class="interval-desc">衡量母體真實平均期望值之 95% 信心範圍 (SE_mean = ${pred.seMean.toFixed(4)})</div>
            </div>

            <div class="pred-interval-box pi-box">
                <div class="interval-tag pi-tag">95% 預測區間 (PI for Individual)</div>
                <div class="interval-range-text">[${formatVal(pred.piLow)}, ${formatVal(pred.piHigh)}]</div>
                <div class="interval-width-text">區間寬度 Δ = ${formatVal(pred.piWidth)}</div>
                <div class="interval-desc">衡量單一新個體真實數值之 95% 涵蓋範圍 (含個體隨機誤差 σ，SE_pred = ${pred.sePred.toFixed(4)})</div>
            </div>
        </div>

        <!-- Top Drivers Pills -->
        <div class="pred-drivers-summary mt-3">
            <span class="drivers-label">主要影響因子：</span>
            ${pred.contributions.slice(0, 4).map(c => `
                <span class="driver-pill ${c.direction}">
                    ${c.feature}: <b>${c.contribution >= 0 ? '+' : ''}${formatVal(c.contribution)}</b>
                </span>
            `).join('')}
        </div>
    `;
}

// ============================================================
// Interactive Form Handlers
// ============================================================
window.handleCustomFeatureChange = function(feature, value) {
    const numVal = parseFloat(value) || 0;
    customDatasetState.customInputs[feature] = numVal;

    // Synchronize number input and slider
    const numInput = document.getElementById(`num-${feature}`);
    const rngInput = document.getElementById(`rng-${feature}`);
    if (numInput && parseFloat(numInput.value) !== numVal) numInput.value = numVal;
    if (rngInput && parseFloat(rngInput.value) !== numVal) rngInput.value = numVal;

    // Live update prediction
    liveUpdateCustomPrediction();
};

function liveUpdateCustomPrediction() {
    if (!customDatasetState.model || !customDatasetState.features) return;

    const pred = calculateSinglePrediction(
        customDatasetState.model,
        customDatasetState.customInputs,
        customDatasetState.features,
        customDatasetState.featureStats
    );
    customDatasetState.currentPrediction = pred;

    // Update result card HTML
    const card = document.getElementById('customPredictionResultCard');
    if (card) {
        card.innerHTML = renderPredictionCardHtml(customDatasetState.target, pred);
    }

    // Update dynamic prediction charts
    updateCustomPredictionCharts(pred);
}

window.executeCustomPrediction = function() {
    liveUpdateCustomPrediction();
    generateAndDisplayReportImage();
};

window.fillCustomInputsWithSample = function() {
    const testData = customDatasetState.testX;
    if (!testData || testData.length === 0) return;

    // Pick a random row
    const randomRow = testData[Math.floor(Math.random() * testData.length)];
    customDatasetState.features.forEach((f, idx) => {
        const val = Math.round(randomRow[idx] * 100) / 100;
        customDatasetState.customInputs[f] = val;
        const numInput = document.getElementById(`num-${f}`);
        const rngInput = document.getElementById(`rng-${f}`);
        if (numInput) numInput.value = val;
        if (rngInput) rngInput.value = val;
    });

    liveUpdateCustomPrediction();
    generateAndDisplayReportImage();
};

window.fillCustomInputsWithMeans = function() {
    const stats = customDatasetState.featureStats;
    customDatasetState.features.forEach(f => {
        const val = Math.round((stats[f] ? stats[f].mean : 0) * 100) / 100;
        customDatasetState.customInputs[f] = val;
        const numInput = document.getElementById(`num-${f}`);
        const rngInput = document.getElementById(`rng-${f}`);
        if (numInput) numInput.value = val;
        if (rngInput) rngInput.value = val;
    });

    liveUpdateCustomPrediction();
    generateAndDisplayReportImage();
};

window.resetCustomInputsToZero = function() {
    customDatasetState.features.forEach(f => {
        customDatasetState.customInputs[f] = 0;
        const numInput = document.getElementById(`num-${f}`);
        const rngInput = document.getElementById(`rng-${f}`);
        if (numInput) numInput.value = 0;
        if (rngInput) rngInput.value = 0;
    });

    liveUpdateCustomPrediction();
    generateAndDisplayReportImage();
};

// ============================================================
// Visualizations: Chart.js Rendering
// ============================================================
function updateCustomPredictionCharts(pred) {
    renderCustomPredictionPointChart(pred, customDatasetState.target);
    renderCustomContributionChart(pred.contributions);
}

function renderCustomPredictionPointChart(pred, targetCol) {
    const ctx = document.getElementById('customPredictionPointChart');
    if (!ctx) return;

    if (customDatasetState.charts.pointPred) {
        customDatasetState.charts.pointPred.destroy();
    }

    const testY = customDatasetState.testY || [pred.yHat];
    const meanY = testY.reduce((a, b) => a + b, 0) / testY.length;

    customDatasetState.charts.pointPred = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['95% PI 下界', '95% CI 下界', '自訂點預測 ŷ', '95% CI 上界', '95% PI 上界', '歷史平均值'],
            datasets: [{
                label: `預測值與區間 (${targetCol})`,
                data: [pred.piLow, pred.ciLow, pred.yHat, pred.ciHigh, pred.piHigh, meanY],
                backgroundColor: [
                    'rgba(148, 163, 184, 0.4)',  // PI low (gray)
                    'rgba(56, 189, 248, 0.6)',   // CI low (cyan)
                    'rgba(244, 63, 94, 0.9)',    // y_hat (rose highlight)
                    'rgba(56, 189, 248, 0.6)',   // CI high (cyan)
                    'rgba(148, 163, 184, 0.4)',  // PI high (gray)
                    'rgba(99, 102, 241, 0.5)'    // Mean
                ],
                borderColor: [
                    '#94a3b8',
                    '#38bdf8',
                    '#f43f5e',
                    '#38bdf8',
                    '#94a3b8',
                    '#6366f1'
                ],
                borderWidth: 1.5,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `數值: ${ctx.parsed.y.toFixed(4)}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8', font: { size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                }
            }
        }
    });
}

function renderCustomContributionChart(contributions) {
    const ctx = document.getElementById('customContributionChart');
    if (!ctx) return;

    if (customDatasetState.charts.contrib) {
        customDatasetState.charts.contrib.destroy();
    }

    // Top 10 contributions
    const topContrib = contributions.slice(0, 10);

    customDatasetState.charts.contrib = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topContrib.map(c => c.feature.length > 18 ? c.feature.slice(0, 16) + '…' : c.feature),
            datasets: [{
                label: '特徵邊際貢獻 β × (x - x̄)',
                data: topContrib.map(c => c.contribution),
                backgroundColor: topContrib.map(c => c.contribution >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                borderColor: topContrib.map(c => c.contribution >= 0 ? '#10b981' : '#ef4444'),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `邊際影響: ${ctx.parsed.x >= 0 ? '+' : ''}${ctx.parsed.x.toFixed(4)}`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: '邊際貢獻值 (相較於均值)', color: '#94a3b8' },
                    ticks: { color: '#94a3b8' },
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

function renderActualVsPredChart(intervals) {
    const ctx = document.getElementById('customActualVsPredChart');
    if (!ctx) return;

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
                legend: { labels: { color: '#94a3b8' } }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Predicted Value (ŷ)', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                y: {
                    title: { display: true, text: 'Residual (e = y - ŷ)', color: '#94a3b8' },
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

    const sorted = featureNames.map((f, i) => ({ name: f, coef: coefficients[i] }))
        .sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef))
        .slice(0, 20);

    customDatasetState.charts.coef = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(d => d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name),
            datasets: [{
                label: 'Regression Coefficient (β)',
                data: sorted.map(d => d.coef),
                backgroundColor: sorted.map(d => d.coef >= 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(244, 63, 94, 0.7)'),
                borderColor: sorted.map(d => d.coef >= 0 ? '#38bdf8' : '#f43f5e'),
                borderWidth: 1,
                borderRadius: 4
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
                    title: { display: true, text: 'Coefficient Value (β)', color: '#94a3b8' },
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
                label: '殘差頻次',
                data: bins.map(b => b.count),
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 4
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
                    title: { display: true, text: 'Residual Bin Midpoint', color: '#94a3b8' },
                    ticks: { color: '#64748b', maxRotation: 45 },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                y: {
                    title: { display: true, text: 'Frequency (頻數)', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                }
            }
        }
    });
}

// ============================================================
// 【產出圖片在網站上】: Canvas Composite Report Image Generator
// ============================================================
function generateAndDisplayReportImage() {
    const pred = customDatasetState.currentPrediction;
    if (!pred || !customDatasetState.model) return;

    const imgEl = document.getElementById('customGeneratedImage');
    const spinner = document.getElementById('imageGeneratingSpinner');
    const downloadBtn = document.getElementById('btnDownloadReportImage');

    if (spinner) spinner.style.display = 'block';
    if (imgEl) imgEl.style.display = 'none';

    // Build high-res offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // 1. Background
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 700);
    bgGradient.addColorStop(0, '#090d16');
    bgGradient.addColorStop(0.5, '#0b1329');
    bgGradient.addColorStop(1, '#050811');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 700);

    // Decorative gradient blur or accents
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.arc(1050, 100, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.beginPath();
    ctx.arc(150, 600, 240, 0, Math.PI * 2);
    ctx.fill();

    // 2. Header Banner
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('HydroPredict AI ‧ 自訂資料多元線性回歸預測分析報告', 50, 58);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const timeStr = new Date().toLocaleString();
    ctx.fillText(`資料集：${customDatasetState.datasetName}  |  預測目標：${customDatasetState.target}  |  產出時間：${timeStr}`, 50, 88);

    // Header divider line
    const lineGrad = ctx.createLinearGradient(50, 102, 1150, 102);
    lineGrad.addColorStop(0, '#38bdf8');
    lineGrad.addColorStop(0.5, '#6366f1');
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 102);
    ctx.lineTo(1150, 102);
    ctx.stroke();

    // 3. Left Panel: Main Prediction Showcase Card
    drawRoundedRect(ctx, 50, 125, 420, 520, 14, 'rgba(15, 23, 42, 0.85)', 'rgba(56, 189, 248, 0.4)');

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚡ 點預測與 95% 區間推論結果', 75, 160);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`目標變數：${customDatasetState.target}`, 75, 185);

    // Large Point Prediction
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "JetBrains Mono", monospace, sans-serif';
    const valText = pred.yHat.toFixed(4);
    ctx.fillText(valText, 75, 235);

    // CI Box
    drawRoundedRect(ctx, 75, 260, 370, 85, 10, 'rgba(56, 189, 248, 0.1)', 'rgba(56, 189, 248, 0.3)');
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('95% 信賴區間 (CI for Mean Response)', 90, 285);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "JetBrains Mono", monospace, sans-serif';
    ctx.fillText(`[${pred.ciLow.toFixed(4)}, ${pred.ciHigh.toFixed(4)}]`, 90, 312);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`區間寬度 Δ = ${pred.ciWidth.toFixed(4)}  (SE_mean = ${pred.seMean.toFixed(4)})`, 90, 332);

    // PI Box
    drawRoundedRect(ctx, 75, 360, 370, 85, 10, 'rgba(168, 85, 247, 0.1)', 'rgba(168, 85, 247, 0.3)');
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('95% 預測區間 (PI for Individual Observation)', 90, 385);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "JetBrains Mono", monospace, sans-serif';
    ctx.fillText(`[${pred.piLow.toFixed(4)}, ${pred.piHigh.toFixed(4)}]`, 90, 412);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`區間寬度 Δ = ${pred.piWidth.toFixed(4)}  (SE_pred = ${pred.sePred.toFixed(4)})`, 90, 432);

    // Diagnostics Line
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`槓桿值 h₀ = ${pred.leverage.toFixed(5)}  |  殘差標準誤 s = ${pred.s.toFixed(4)}`, 75, 475);
    ctx.fillText(`模型決定係數 Test R² = ${customDatasetState.metrics.testR2.toFixed(4)}  |  RMSE = ${customDatasetState.metrics.testRMSE.toFixed(4)}`, 75, 498);

    // Top Feature Drivers in Box
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('自訂數值關鍵邊際驅動項：', 75, 532);

    pred.contributions.slice(0, 3).forEach((c, i) => {
        const yPos = 555 + i * 24;
        ctx.fillStyle = c.contribution >= 0 ? '#10b981' : '#f43f5e';
        const sign = c.contribution >= 0 ? '+' : '';
        ctx.fillText(`• ${c.feature}: ${sign}${c.contribution.toFixed(4)} (x=${c.value})`, 85, yPos);
    });

    // 4. Right Top Chart: Custom Prediction Position Chart
    drawRoundedRect(ctx, 500, 125, 650, 245, 14, 'rgba(15, 23, 42, 0.85)', 'rgba(255, 255, 255, 0.08)');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('🎯 自訂預測點與 95% CI / PI 區間分佈視覺化', 525, 155);

    // Draw prediction point chart from chart canvas if ready
    const pointChartCanvas = document.getElementById('customPredictionPointChart');
    if (pointChartCanvas && pointChartCanvas.width > 0) {
        ctx.drawImage(pointChartCanvas, 520, 168, 610, 190);
    }

    // 5. Right Bottom Chart: Feature Contributions Chart
    drawRoundedRect(ctx, 500, 395, 650, 250, 14, 'rgba(15, 23, 42, 0.85)', 'rgba(255, 255, 255, 0.08)');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('📊 各特徵邊際貢獻瀑布圖 (Feature Attribution)', 525, 425);

    const contribChartCanvas = document.getElementById('customContributionChart');
    if (contribChartCanvas && contribChartCanvas.width > 0) {
        ctx.drawImage(contribChartCanvas, 520, 438, 610, 195);
    }

    // 6. Watermark Footer
    ctx.fillStyle = '#475569';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('AIoT HW2 Multiple Linear Regression System ‧ CRISP-DM Deployment ‧ 學號：7115056029', 50, 680);

    // Export to data URL
    const dataUrl = canvas.toDataURL('image/png');
    customDatasetState.lastGeneratedImageUrl = dataUrl;

    if (imgEl) {
        imgEl.src = dataUrl;
        imgEl.style.display = 'block';
    }
    if (spinner) spinner.style.display = 'none';

    if (downloadBtn) {
        downloadBtn.href = dataUrl;
        downloadBtn.download = `Prediction_${customDatasetState.target}_${Date.now()}.png`;
    }
}
window.generateAndDisplayReportImage = generateAndDisplayReportImage;

function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }
    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// ============================================================
// Auto-Initialize on DOM Loaded
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initCustomDatasetModule();
});
