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

# Load the data
df = pd.read_csv('./german_credit_data.csv')

# Convert all column names to lowercase
df.columns = [col.lower() for col in df.columns]

# Remove rows with NA values
print(f"Original number of rows: {len(df)}")
df = df.dropna()
print(f"Number of rows after removing NA: {len(df)}")

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

# Preprocess the data
y = df['risk'].reset_index(drop=True)
X = df.drop('risk', axis=1).reset_index(drop=True)

# Fit and transform the data
X_processed = preprocessor.fit_transform(X)

# Apply UMAP
reducer = umap.UMAP(
    n_neighbors=15,
    min_dist=0.1,
    n_components=2,
    random_state=42
)

embedding = reducer.fit_transform(X_processed)

# Save the UMAP model and preprocessor
joblib.dump(reducer, 'umap_model.joblib')
joblib.dump(preprocessor, 'preprocessor.joblib')
print("\nSaved UMAP model and preprocessor for later use")

# Create DataFrame for plotting
umap_df = pd.DataFrame(embedding, columns=['UMAP1', 'UMAP2'])
umap_df['risk'] = y

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

# Combine original data with UMAP embeddings
original_df = X.copy()
original_df['risk'] = y
combined_df = pd.concat([original_df, umap_df[['UMAP1', 'UMAP2']]], axis=1)

# Create a list of dictionaries for JSON export
json_data = []
for idx, row in combined_df.iterrows():
    point_data = {
        'id': int(idx),
        'x': float(row['UMAP1']),
        'y': float(row['UMAP2']),
        'risk': str(row['risk']),
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
    json_data.append(point_data)

# Save as JSON
with open('german_credit_umap.json', 'w') as f:
    json.dump(json_data, f, indent=2)

print("\nSaved UMAP data to 'german_credit_umap.json'")

# Create and save a UMAP visualization
plt.figure(figsize=(10, 8))
sns.scatterplot(
    data=umap_df,
    x='UMAP1',
    y='UMAP2',
    hue='risk',
    palette={'good': 'green', 'bad': 'red'},
    alpha=0.6
)
plt.title('UMAP Projection of German Credit Dataset')
plt.savefig('umap_german_credit.png')
plt.close()

# Print transformation info
print(f"Original data shape: {X.shape}")
print(f"Processed data shape: {X_processed.shape}")
print(f"UMAP embedding shape: {embedding.shape}")
print(f"UMAP embedding values: {embedding[:3]}")

# Save the processed UMAP embedding
np.save('umap_embedding.npy', embedding)
