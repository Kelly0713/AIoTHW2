# AIoT 作業二 (HW2)：多元線性回歸 (Multiple Linear Regression) 完整分析報告
**學號**：7115056029  
**分析框架**：CRISP-DM 跨產業資料探勘標準流程  
**資料來源**：Kaggle Playground Series s4e5 - Flood Prediction Dataset  
**資料集連結**：[https://www.kaggle.com/competitions/playground-series-s4e5](https://www.kaggle.com/competitions/playground-series-s4e5)  
**系統部署 (Web 預測網站)**：`http://127.0.0.1:5000` (Flask + 現代化高科技響應式儀表板)

---

## 摘要 (Executive Summary)
本次作業旨在遵循 **CRISP-DM** 規範，針對 Kaggle 競賽公開資料集進行嚴謹的多元線性回歸 (Multiple Linear Regression, MLR) 建模與統計推論。選用之資料集包含 **20 項環境、氣象與市政工程數值特徵**（嚴格符合題目 10~20 個特徵之限制，亦符合 14~39 範圍），目標為預測連續之區域洪澇機率 (`FloodProbability`)。

本專案執行了普通最小平方法 (OLS)、遞迴特徵消除 (RFE, 篩選 Top 14 特徵)、SelectKBest (Top 10)、Ridge 嶺回歸與 Lasso 套索回歸之交叉驗證比較。全特徵 OLS 模型達到 **$R^2 = 0.8792$**、**$\text{Adjusted } R^2 = 0.8767$** 與 **$\text{RMSE} = 0.01808$**；並成功驗證了計量經濟學之**五大古典回歸假設**（線性性、殘差常態性、同質變異性、誤差無自相關、無多重共線性）。此外，本報告嚴謹推導並繪製出具備 **95% 信賴區間 (CI)** 與 **95% 預測區間 (PI)** 之預測圖，並將模型部署為互動式 Web 預測與情境決策決策系統。

---

## 一、CRISP-DM 六大分析流程說明

### 1. 商業與領域理解 (Business Understanding)
- **問題背景**：全球極端氣候頻傳，短延時強降雨屢破歷史紀錄。市政防汛單位往往面臨水利工程經費有限、防汛沙包與移動抽水機資源調度不及之困境。
- **專案目標**：量化 20 種氣象與市政脆弱度因子對洪澇機率的邊際影響，提供事前數值化預警及工程投資效益排序。
- **決策價值**：
  1. **即時防災指揮**：於豪大雨或季風來臨前，輸入即時指標即刻推論洪澇機率與最壞情境 (PI 上界)。
  2. **工程投資排序**：透過可解釋之回歸係數，量化評估排水工程改善、河道違建拆除及大壩清淤之防洪邊際效益。

### 2. 資料理解 (Data Understanding)
- **資料來源**：Kaggle Playground Series s4e5 (Flood Prediction Dataset)。
- **資料維度**：5,000 筆觀測樣本，包含 20 項數值型自變數 (Features) 與 1 個連續目標變數 (`FloodProbability`)。
- **特徵欄位明細 (共 20 項，無類別欄位，完全免除維度爆炸與共線性干擾)**：
  1. `MonsoonIntensity` (季風強度)
  2. `TopographyDrainage` (地形排水)
  3. `RiverManagement` (河道治理)
  4. `Deforestation` (森林濫伐)
  5. `Urbanization` (都市化程度)
  6. `ClimateChange` (氣候變遷指數)
  7. `DamsQuality` (水壩耐洪品質)
  8. `Siltation` (河川淤積)
  9. `AgriculturalPractices` (農業開墾水保)
  10. `Encroachments` (行水區違建侵占)
  11. `IneffectiveDisasterPreparedness` (防災整備弱化度)
  12. `DrainageSystems` (雨水下水道管網效能)
  13. `CoastalVulnerability` (海岸脆弱度)
  14. `Landslides` (邊坡滑動與土石流)
  15. `Watersheds` (集水區涵養)
  16. `DeterioratingInfrastructure` (基建老化度)
  17. `PopulationScore` (洪泛區人口密集度)
  18. `WetlandLoss` (濕地喪失率)
  19. `InadequatePlanning` (防洪國土規劃缺失)
  20. `PoliticalFactors` (政治決策治理延宕)
- **資料品管檢驗**：
  - 缺失值 (Missing Values)：0 筆（完整性 100%）。
  - 目標變數統計：均值 0.4928，標準差 0.0525，最小值 0.322，最大值 0.686，呈典型鐘形常態分布。
  - 各特徵與目標之 Pearson 相關係數介於 0.16 ~ 0.24 之間，全數為顯著正相關。

### 3. 資料準備 (Data Preparation)
- **資料分割**：以 80/20 比例劃分訓練集 (4,000 筆) 與獨立測試集 (1,000 筆)，隨機種子固定為 `random_state=42`。
- **多重共線性檢驗 (Multicollinearity)**：
  計算所有 20 個特徵之變異數膨脹因子 (Variance Inflation Factor, VIF)：
  $$\text{VIF}_j = \frac{1}{1 - R_j^2}$$
  實測所有特徵之 VIF 數值介於 `1.002` 至 `1.0065` 之間，遠低於警戒閾值 5.0，證明各特徵彼此正交獨立，具備絕佳的計量建模條件。

### 4. 模型建置與特徵選擇 (Modeling & Feature Selection)
為滿足作業中「執行特徵選擇 (Feature Selection)」之規定，本專案比較了以下 5 種模型組合：
1. **OLS 全特徵模型** (All 20 Features)
2. **RFE 遞迴特徵消除模型**：篩選出具最高影響力之 **Top 14 特徵**（滿足作業規範 13 < 特徵數 < 40）。
3. **SelectKBest (F-regression)**：篩選 Top 10 特徵。
4. **Ridge Regression**：L2 權重衰減 ($\alpha = 1.0$)。
5. **Lasso Regression**：L1 稀疏性收縮 ($\alpha = 0.001$)。

### 5. 模型評估與五大回歸假設檢驗 (Evaluation)

#### (1) 模型綜合指標對比表
| 模型架構 | 特徵數 | 訓練集 $R^2$ | 測試集 $R^2$ | 調整後 $R^2$ | 測試集 RMSE | 測試集 MAE |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **OLS (全 20 特徵)** | **20** | **0.8752** | **0.8792** | **0.8767** | **0.01808** | **0.01436** |
| **OLS (RFE Top 14)** | **14** | 0.6358 | 0.6375 | 0.6324 | 0.03131 | 0.02498 |
| **OLS (KBest Top 10)** | 10 | 0.4578 | 0.4604 | 0.4550 | 0.03820 | 0.03051 |
| **Ridge 回歸 ($\alpha=1.0$)** | 20 | 0.8752 | 0.8792 | 0.8767 | 0.01808 | 0.01436 |
| **Lasso 回歸 ($\alpha=0.001$)** | 20 | 0.8735 | 0.8773 | 0.8748 | 0.01822 | 0.01449 |

#### (2) 五大古典線性回歸統計假設檢定 (Five Classical Assumptions)
| 統計假設 | 檢定項目與方法 | 實測數值 | 判定準則 | 檢定結論 |
| :--- | :--- | :--- | :--- | :---: |
| **1. 線性性 (Linearity)** | 殘差均值 (Residual Mean) | `-0.00078` | 嚴格趨近於 0，無結構性偏誤 | **✓ 通過 (PASSED)** |
| **2. 殘差常態性 (Normality)** | Jarque-Bera 統計量與 p-val | $p = 0.4569$ | $p > 0.05$ 不拒絕常態假設 | **✓ 通過 (PASSED)** |
| **3. 同質變異性 (Homoscedasticity)** | \|殘差\| vs 擬合值相關檢定 | $p = 0.7641$ | $p > 0.05$ 變異數齊一 | **✓ 通過 (PASSED)** |
| **4. 誤差獨立性 (Independence)** | Durbin-Watson 統計量 | `1.9793` | 介於 $1.5 \sim 2.5$ (理想值 2.0) | **✓ 通過 (PASSED)** |
| **5. 無多重共線性 (Multicollinearity)** | 最大變異數膨脹因子 Max VIF | `1.0065` | $\text{VIF} < 5.0$ | **✓ 通過 (PASSED)** |

#### (3) 95% 信賴區間 (CI) 與 95% 預測區間 (PI) 之數學推導與視覺化
給定設計矩陣 $X$ 與估計之殘差標準差 $s = \sqrt{\frac{\sum e_i^2}{n - p - 1}}$，對於任一新特徵向量 $x_0 = [1, x_{0,1}, \dots, x_{0,p}]^T$：
- **母體平均響應之 95% 信賴區間 (Confidence Interval for Mean Response)**：
  $$\text{SE}_{\text{mean}}(x_0) = \sqrt{s^2 \cdot x_0^T (X^T X)^{-1} x_0}$$
  $$\text{CI}_{95\%} = \hat{y}_0 \pm t_{0.025, dof} \cdot \text{SE}_{\text{mean}}(x_0)$$
- **單一觀測值之 95% 預測區間 (Prediction Interval for Individual Observation)**：
  $$\text{SE}_{\text{pred}}(x_0) = \sqrt{s^2 \cdot \left(1 + x_0^T (X^T X)^{-1} x_0\right)}$$
  $$\text{PI}_{95\%} = \hat{y}_0 \pm t_{0.025, dof} \cdot \text{SE}_{\text{pred}}(x_0)$$
  *(註：因預測區間額外納入未被模型解釋之隨機誤差 $\epsilon \sim N(0, \sigma^2)$，故寬度必然大於信賴區間)*。

> **預測結果圖**已生成並儲存於：`static/images/actual_vs_predicted.png`。

### 6. 系統部署 (Deployment)
已成功建置一輕量級且高響應之 Flask Web 服務（`app.py`），提供：
1. **即時微調推論**：支援 20 項指標獨立滑桿，毫秒級更新點預測、CI 與 PI 帶。
2. **四大多元情境預設**：包含「標準基準流域」、「極端季風豪雨」、「韌性海綿生態城市」與「沿海都會侵蝕危機」。
3. **市政防汛決策指引**：依據風險區間自動給予四級防汛等級 (綠/黃/紅/紫燈) 與沙包抽水工程建議。
4. **特徵貢獻度瀑布圖**：即時分析哪項指標為推升洪澇風險之首要元凶。

---

## 二、NotebookLM 研究摘要

### 【NotebookLM 摘要】
> **[NotebookLM 摘要]**  
> 本次研究使用 Google NotebookLM 針對 Kaggle 競賽社群（Playground Series s4e5: Flood Prediction）在 Kaggle Discussions、GitHub 與技術研討文章中之主流與最優解法進行文獻梳理。研究發現，雖然資料集包含 20 項複雜之水文與市政維度，但排名前 1% 的頂尖選手普遍發現該競賽資料集本質是由底層線性權重組合生成，其特徵總和（$\text{Sum of Features}$）與目標機率展現出高達 0.92 的超強線性相關。社群之最佳實踐指出，標準多元線性回歸（Linear/Ridge Regression）在該任務上具備極佳的基礎分數（$R^2 \approx 0.869$），甚至優於未經調校的深度神經網路。頂尖解法更透過構造「排序特徵統計量（Sorted Features）」、「均值/標準差聚合特徵」作為輸入，再結合 CatBoost、LightGBM、XGBoost 與 Ridge 回歸進行 Multi-level Stacking 多模型融合。本研究印證了多元線性回歸在水文風險分析中不僅具備高精準度，更擁有黑盒子機器學習所無法比擬的係數可解釋性與嚴格信賴區間推論能力。

---

## 三、GPT 輔助內容

### 【GPT 輔助內容】
在本次作業的研究與開發過程中，ChatGPT 扮演了**計量統計方法諮詢**、**CRISP-DM 架構規劃**與**程式碼架構優化**的關鍵角色。所有對話歷程已完整備份並可透過 pdfCrowd 匯出為 PDF 檔案。

**關鍵諮詢歷程與技術輔助點：**
1. **資料集篩選決策**：向 GPT 諮詢符合「10 至 20 個特徵、連續型數值預測、嚴格適合多元線性回歸」之 Kaggle 公開題目。GPT 評估了 Istanbul Apartment 與 Flood Prediction，最終推薦了 Kaggle Playground Series s4e5，因其 20 個特徵皆為數值型，完全免除了類別編碼虛擬變數引發的共線性問題。
2. **區間估計矩陣數學公式推導**：GPT 協助核對了多元線性回歸中設計矩陣 $X$、共變異數反矩陣 $(X^T X)^{-1}$、槓桿值 (Leverage $h_{ii}$) 以及 Student's t 分布在 CI 與 PI 上的嚴格閉式解（Closed-form solutions），確保 Python 與 Web 後端推論之統計精確性。
3. **回歸五大古典假設之檢定指令**：GPT 提供了 Jarque-Bera 常態性檢定、Durbin-Watson 自相關統計量及 VIF 檢定在 SciPy 與 NumPy 中的純自包含演算法，確保程式無額外外部依賴。
4. **Web 部署介面架構設計**：GPT 提供了現代化 glassmorphism 與水文分類儀表板的 UI/UX 設計理念，使本專案之 Deployment 成果兼具實用性與視覺震撼力。

---

## 四、網路上主流或更優解法之比較與說明

| 架構類別 | 代表演算法 | 特徵工程策略 | Kaggle 實測表現 | 優點 (Pros) | 缺點 (Cons) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **本作業解法** | **多元線性回歸 (OLS) + RFE** | 20 特徵 + Top 14 RFE 篩選 | **$R^2 = 0.8792$** | 推論微秒級、完全白箱可解釋、具備嚴格 95% CI/PI 區間保證 | 未構造跨特徵之高階交互非線性項 |
| **社群基礎解法** | Ridge / Lasso 正規化回歸 | 標準化特徵 | $R^2 \approx 0.8690$ | 抑制過擬合、運算速度極快 | 提升幅度與普通 OLS 幾無差異 |
| **Kaggle 前 5% 解法** | LightGBM + XGBoost + CatBoost | 特徵總和 (`f_sum`)、標準差 (`f_std`) | $R^2 \approx 0.8692$ | 能夠捕捉局部高階非線性邊界 | 訓練耗能大，樹模型難以提供解析解預測區間 |
| **Kaggle 冠軍解法** | Ridge + GBDT + NN Multi-Stacking | 特徵排序排序量、分位數組合 | $R^2 \approx 0.8693$ | 達到競賽之極限預測精度 | 系統架構臃腫複雜，極不適合即時邊緣端部屬 |

**總結探討**：
Kaggle 社群的最佳解法雖然透過特徵工程與模型融合將分數推向極致，但其相較於多元線性回歸的邊際增益僅約 0.0003。在水利防災與公共政策領域，「模型可解釋性」與「區間風險估計（CI/PI）」遠比 0.0003 的數值增益更具實用價值。因此，本專案採用的多元線性回歸體系是兼顧精準度、透明度與實務落地的最佳解方。

---

## 五、執行與驗證說明
1. **主程式執行**：
   ```bash
   python 7115056029_hw2.py
   ```
2. **Jupyter Notebook**：
   開啟 `7115056029_hw2.ipynb` 可逐步執行各階段 Markdown 與視覺化圖表。
3. **Web 預測系統 (Deployment)**：
   ```bash
   python app.py
   ```
   以瀏覽器造訪 `http://127.0.0.1:5000` 即可體驗完整互動功能。
