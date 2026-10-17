"""
Script to generate benchmark dataset matching Kaggle Playground Series s4e5:
Flood Prediction Dataset (20 features, continuous FloodProbability target).
"""
import numpy as np
import pandas as pd

def generate_kaggle_s4e5_flood_data(n_samples=5000, random_state=42):
    np.random.seed(random_state)
    
    features = [
        'MonsoonIntensity',
        'TopographyDrainage',
        'RiverManagement',
        'Deforestation',
        'Urbanization',
        'ClimateChange',
        'DamsQuality',
        'Siltation',
        'AgriculturalPractices',
        'Encroachments',
        'IneffectiveDisasterPreparedness',
        'DrainageSystems',
        'CoastalVulnerability',
        'Landslides',
        'Watersheds',
        'DeterioratingInfrastructure',
        'PopulationScore',
        'WetlandLoss',
        'InadequatePlanning',
        'PoliticalFactors'
    ]
    
    # Kaggle s4e5 feature values typically range from 0 to 16, centered around 4.5 - 5.5
    # with Poisson / discreet distribution
    data = {}
    for feat in features:
        # Base Poisson/Binomial distribution with slight mean variation
        lam = np.random.uniform(4.5, 5.5)
        vals = np.random.poisson(lam=lam, size=n_samples)
        # Clip to realistic ranges [0, 16]
        vals = np.clip(vals, 0, 16)
        data[feat] = vals
        
    df = pd.DataFrame(data)
    
    # Ground truth weights: in s4e5, all 20 factors positively contribute to flood risk
    # weights around 0.004 to 0.006 per feature unit
    # Base probability ~ 0.15 to 0.20 + sum(weights * X) + small Gaussian noise
    base_weights = np.array([
        0.0052, 0.0048, 0.0051, 0.0047, 0.0050, 
        0.0053, 0.0046, 0.0049, 0.0045, 0.0052,
        0.0055, 0.0049, 0.0051, 0.0047, 0.0048,
        0.0054, 0.0050, 0.0046, 0.0053, 0.0047
    ])
    
    linear_comb = df[features].values @ base_weights
    # Intercept
    intercept = 0.005
    noise = np.random.normal(loc=0.0, scale=0.018, size=n_samples)
    
    flood_prob = intercept + linear_comb + noise
    # Kaggle target is typically bounded between [0.285, 0.725]
    flood_prob = np.clip(flood_prob, 0.285, 0.725)
    # Round to 3 decimal places as in Kaggle dataset
    flood_prob = np.round(flood_prob, 3)
    
    df['FloodProbability'] = flood_prob
    
    output_path = 'data/flood_prediction_data.csv'
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully created with {df.shape[0]} samples and {df.shape[1]-1} features.")
    print(f"Target 'FloodProbability' mean={df['FloodProbability'].mean():.4f}, std={df['FloodProbability'].std():.4f}, min={df['FloodProbability'].min()}, max={df['FloodProbability'].max()}")
    return df

if __name__ == '__main__':
    generate_kaggle_s4e5_flood_data()
