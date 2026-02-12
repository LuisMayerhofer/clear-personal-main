import pandas as pd
import numpy as np
import json
import os
import shutil
# Removed: import umap

# Load the joint data (original + counterfactuals)
df = pd.read_csv('./joint_credit_data.csv')

# Convert all column names to lowercase
df.columns = [col.lower() for col in df.columns]

# Define the columns we need for the JSON output
required_columns = ['age', 'sex', 'job', 'housing', 'saving accounts', 'checking account', 
                   'credit amount', 'duration', 'purpose', 'counterfactual']

# Keep only rows that have all required feature columns
df_features_clean = df[required_columns].dropna()
valid_indices = df_features_clean.index
df = df.loc[valid_indices].copy()

# Group infrequent 'purpose' values (keeping logic consistent with previous version)
purpose_mapping = {
    'radio/TV': 'radio/TV',
    'car': 'car',
    'furniture/equipment': 'furniture'
}
df['purpose'] = df['purpose'].map(lambda x: purpose_mapping.get(x, 'others'))

# Group 'saving accounts' levels
saving_mapping = {
    'little': 'little',
    'moderate': 'moderate',
    'quite rich': 'rich',
    'rich': 'rich'
}
df['saving accounts'] = df['saving accounts'].map(lambda x: saving_mapping.get(x, x))

# --- SKIPPING UMAP GENERATION ---
print("Skipping UMAP calculation (generating random coordinates instead)...")

# Generate random coordinates [0, 1] for x and y
# This satisfies the frontend's need for x/y properties without running the heavy algorithm
embedding = np.random.rand(len(df), 2)

# Create DataFrame for merging
umap_df = pd.DataFrame(embedding, columns=['UMAP1', 'UMAP2'])
umap_df['counterfactual'] = df['counterfactual'].reset_index(drop=True)

# Combine original data with the dummy embeddings
# Reset index to ensure alignment
df_reset = df.reset_index(drop=True)
combined_df = pd.concat([df_reset, umap_df[['UMAP1', 'UMAP2']]], axis=1)

# Handle risk column (fill missing with 'unknown')
if 'risk' not in combined_df.columns:
    combined_df['risk'] = 'unknown'
else:
    combined_df['risk'] = combined_df['risk'].fillna('unknown')

# Create a list of dictionaries for JSON export
json_data = []
for idx, row in combined_df.iterrows():
    # Determine data type based on counterfactual flag
    data_type_map = {0: 'training', 1: 'counterfactual', 2: 'user'}
    data_type = data_type_map.get(row['counterfactual'], 'unknown')
    
    point_data = {
        'id': int(idx),
        'x': float(row['UMAP1']), # Dummy coordinate
        'y': float(row['UMAP2']), # Dummy coordinate
        'risk': str(row['risk']),
        'counterfactual': bool(row['counterfactual']),
        'data_type': data_type,
        'features': {
            'age': float(row['age']),
            'credit_amount': float(row['credit amount']),
            'duration': float(row['duration']),
            'job': int(row['job']),
            'sex': str(row['sex']),
            'housing': str(row['housing']),
            'saving_accounts': str(row['saving accounts']),
            'checking_account': str(row['checking account']),
            'purpose': str(row['purpose'])
        }
    }
    
    # Add prediction probability if available
    if 'pred' in row and pd.notna(row['pred']):
        point_data['pred'] = float(row['pred'])
    
    json_data.append(point_data)

# Save as JSON
output_filename = 'german_credit_umap_with_counterfactuals.json'
with open(output_filename, 'w') as f:
    json.dump(json_data, f, indent=2)

print(f"\nSaved data to '{output_filename}'")

# Copy the JSON file to the assets directory for the frontend
# Note: Using '../public/assets' based on your folder structure (src/python-server -> src/public/assets)
assets_dir = '../public/assets' 
if not os.path.exists(assets_dir):
    try:
        os.makedirs(assets_dir)
    except OSError:
        # Fallback if running from a different context
        pass

try:
    shutil.copy2(output_filename, os.path.join(assets_dir, output_filename))
    print(f"Copied data to {assets_dir} for frontend access")
except Exception as e:
    print(f"Warning: Could not copy to assets folder: {e}")
    # Try one level deeper just in case the execution context is different
    try:
        alt_assets_dir = '../../public/assets'
        if os.path.exists(os.path.dirname(alt_assets_dir)):
             shutil.copy2(output_filename, os.path.join(alt_assets_dir, output_filename))
             print(f"Copied data to {alt_assets_dir} instead")
    except:
        pass

print(f"Total data points processed: {len(json_data)}")