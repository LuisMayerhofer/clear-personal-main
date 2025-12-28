import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import umap
import matplotlib.pyplot as plt
import seaborn as sns
import json
import joblib
import os
import shutil

# Load the joint data (original + counterfactuals)
df = pd.read_csv('./joint_credit_data.csv')

# Convert all column names to lowercase
df.columns = [col.lower() for col in df.columns]

# Remove rows with NA values in critical columns only
print(f"Original number of rows: {len(df)}")

# Define the columns we actually need for UMAP (including risk for analysis)
required_columns = ['age', 'sex', 'job', 'housing', 'saving accounts', 'checking account', 
                   'credit amount', 'duration', 'purpose', 'counterfactual']

# Also include risk column if it exists
if 'risk' in df.columns:
    analysis_columns = required_columns + ['risk']
else:
    analysis_columns = required_columns

# Check for missing values only in required columns
print("Missing values per column:")
for col in analysis_columns:
    if col in df.columns:
        missing_count = df[col].isna().sum()
        print(f"  {col}: {missing_count} missing values")

# Keep only rows that have all required feature columns (but allow missing risk)
df_features_clean = df[required_columns].dropna()
valid_indices = df_features_clean.index

# Filter the original dataframe to keep these rows
df = df.loc[valid_indices].copy()
print(f"Number of rows after removing NA in required feature columns: {len(df)}")

# Print distribution of data types
original_count = len(df[df['counterfactual'] == 0])
counterfactual_count = len(df[df['counterfactual'] == 1])
user_count = len(df[df['counterfactual'] == 2])
print(f"Training data points: {original_count}")
print(f"Counterfactual data points: {counterfactual_count}")
print(f"User data points: {user_count}")

# Group infrequent 'purpose' values
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

# Define categorical and numerical columns
categorical_cols = ['sex', 'housing', 'saving accounts', 'checking account', 'purpose']
ordinal_cols = ['job']  # Job has a natural order (0, 1, 2, 3)
numerical_cols = ['age', 'credit amount', 'duration']

# Create preprocessing pipelines
categorical_transformer = Pipeline(steps=[
    ('onehot', OneHotEncoder(sparse_output=False, handle_unknown='ignore'))
])

ordinal_transformer = Pipeline(steps=[
    ('ordinal', OrdinalEncoder())
])

numerical_transformer = Pipeline(steps=[
    ('scaler', StandardScaler())
])

# Combine preprocessing steps
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', categorical_transformer, categorical_cols),
        ('ord', ordinal_transformer, ordinal_cols),
        ('num', numerical_transformer, numerical_cols)
    ])

# Prepare data for processing (exclude counterfactual column from features)
# Handle missing risk values for user data
if 'risk' not in df.columns:
    df['risk'] = 'unknown'  # Default value for user data
else:
    # Fill missing risk values (typically for user data)
    df['risk'] = df['risk'].fillna('unknown')

y = df['risk'].reset_index(drop=True)
counterfactual_flags = df['counterfactual'].reset_index(drop=True)
X = df.drop(['risk', 'counterfactual'], axis=1).reset_index(drop=True)

# Fit and transform the data
X_processed = preprocessor.fit_transform(X)

# Apply UMAP to the combined dataset
reducer = umap.UMAP(
    n_neighbors=15,
    min_dist=0.1,
    n_components=2,
    random_state=42
)

embedding = reducer.fit_transform(X_processed)

# Save the UMAP model and preprocessor
joblib.dump(reducer, 'umap_model_with_counterfactuals.joblib')
joblib.dump(preprocessor, 'preprocessor_with_counterfactuals.joblib')
print("\nSaved UMAP model and preprocessor for later use")

# Create DataFrame for plotting
umap_df = pd.DataFrame(embedding, columns=['UMAP1', 'UMAP2'])
umap_df['risk'] = y
umap_df['counterfactual'] = counterfactual_flags
umap_df['data_type'] = counterfactual_flags.map({0: 'training', 1: 'counterfactual', 2: 'user'})

# Get feature names from the preprocessor
categorical_features = []
for name, trans, cols in preprocessor.transformers_:
    if name == 'cat':
        feature_names = trans.named_steps['onehot'].get_feature_names_out(cols)
        categorical_features.extend(feature_names)
    elif name == 'ord':
        categorical_features.extend(cols)
    elif name == 'num':
        categorical_features.extend(cols)

# Create DataFrame with processed features
processed_df = pd.DataFrame(X_processed, columns=categorical_features)
processed_df['risk'] = y
processed_df['counterfactual'] = counterfactual_flags

# Combine original data with UMAP embeddings
original_df = X.copy()
original_df['risk'] = y
original_df['counterfactual'] = counterfactual_flags
combined_df = pd.concat([original_df, umap_df[['UMAP1', 'UMAP2']]], axis=1)

# Create a list of dictionaries for JSON export
json_data = []
for idx, row in combined_df.iterrows():
    # Determine data type based on counterfactual flag
    data_type_map = {0: 'training', 1: 'counterfactual', 2: 'user'}
    data_type = data_type_map.get(row['counterfactual'], 'unknown')
    
    point_data = {
        'id': int(idx),
        'x': float(row['UMAP1']),
        'y': float(row['UMAP2']),
        'risk': str(row['risk']),
        'counterfactual': bool(row['counterfactual']),  # Keep for backward compatibility
        'data_type': data_type,  # Add explicit data type
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

# Save as JSON (update the filename to indicate it includes counterfactuals and user data)
with open('german_credit_umap_with_counterfactuals.json', 'w') as f:
    json.dump(json_data, f, indent=2)

print("\nSaved UMAP data with counterfactuals and user data to 'german_credit_umap_with_counterfactuals.json'")

# Copy the JSON file to the assets directory for the frontend
assets_dir = '../../public/assets'  # Changed from ../public/assets to ../../public/assets
if not os.path.exists(assets_dir):
    os.makedirs(assets_dir)
    
shutil.copy2('german_credit_umap_with_counterfactuals.json', 
             os.path.join(assets_dir, 'german_credit_umap_with_counterfactuals.json'))
print(f"Copied UMAP data to {assets_dir} for frontend access")

# Create and save enhanced UMAP visualization with all data types
plt.figure(figsize=(12, 10))

# Separate data by type
training_data = umap_df[umap_df['counterfactual'] == 0]
counterfactual_data = umap_df[umap_df['counterfactual'] == 1]
user_data = umap_df[umap_df['counterfactual'] == 2]

# Plot training data
sns.scatterplot(
    data=training_data,
    x='UMAP1',
    y='UMAP2',
    hue='risk',
    palette={'good': 'green', 'bad': 'red', 'unknown': 'gray'},
    alpha=0.6,
    s=50
)

# Plot counterfactual data in blue
if len(counterfactual_data) > 0:
    plt.scatter(
        counterfactual_data['UMAP1'],
        counterfactual_data['UMAP2'],
        c='blue',
        alpha=0.8,
        s=50,
        label='Counterfactuals',
        marker='s'  # Square markers for counterfactuals
    )

# Plot user data in orange
if len(user_data) > 0:
    plt.scatter(
        user_data['UMAP1'],
        user_data['UMAP2'],
        c='orange',
        alpha=1.0,
        s=100,
        label='User Data',
        marker='*',  # Star markers for user data
        edgecolors='black',
        linewidth=1
    )

plt.title('UMAP Projection of German Credit Dataset with Counterfactuals and User Data')
plt.legend()
plt.savefig('umap_german_credit_with_counterfactuals.png', dpi=300, bbox_inches='tight')
plt.close()

# Print transformation info
print(f"Original data shape: {X.shape}")
print(f"Processed data shape: {X_processed.shape}")
print(f"UMAP embedding shape: {embedding.shape}")
print(f"Total data points: {len(embedding)}")
print(f"Training points: {original_count}")
print(f"Counterfactual points: {counterfactual_count}")
print(f"User points: {user_count}")

# Save the processed UMAP embedding
np.save('umap_embedding_with_counterfactuals.npy', embedding)

# Print sample data to verify structure
print("\nSample of generated JSON data:")
for i in range(min(5, len(json_data))):
    data_type = json_data[i].get('data_type', 'unknown')
    print(f"Point {i}: data_type={data_type}, risk={json_data[i]['risk']}")
