import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import umap
import joblib
import json

def load_original_model():
    """Load the saved UMAP model and preprocessor"""
    try:
        reducer = joblib.load('umap_model.joblib')
        preprocessor = joblib.load('preprocessor.joblib')
        return reducer, preprocessor
    except FileNotFoundError:
        print("Error: Could not find saved model files. Please run generate_umap_embeddings.py first.")
        return None, None

def map_new_data(input_csv_path, output_json_path):
    """
    Map new data points to the existing UMAP embedding space

    Args:
        input_csv_path: Path to the new CSV file with data to map
        output_json_path: Path where to save the mapped data as JSON
    """
    # Load the saved model and preprocessor
    reducer, preprocessor = load_original_model()
    if reducer is None or preprocessor is None:
        return

    # Load and clean the new data
    try:
        new_df = pd.read_csv(input_csv_path)
    except FileNotFoundError:
        print(f"Error: Could not find input file at {input_csv_path}")
        return

    # Lowercase column names to match training preprocessing
    new_df.columns = [col.lower() for col in new_df.columns]

    print(f"Original number of rows: {len(new_df)}")
    new_df = new_df.dropna()
    print(f"Number of rows after removing NA: {len(new_df)}")

    # Group categories to match training preprocessing
    if 'purpose' in new_df.columns:
        purpose_mapping = {
            'radio/tv': 'radio/TV',
            'car': 'car',
            'furniture/equipment': 'furniture'
        }
        new_df['purpose'] = new_df['purpose'].map(lambda x: purpose_mapping.get(x, 'others'))

    if 'saving accounts' in new_df.columns:
        saving_mapping = {
            'little': 'little',
            'moderate': 'moderate',
            'quite rich': 'rich',
            'rich': 'rich'
        }
        new_df['saving accounts'] = new_df['saving accounts'].map(lambda x: saving_mapping.get(x, x))

    # Preprocess new data
    X_new = new_df.drop('risk', axis=1, errors='ignore')
    X_new_processed = preprocessor.transform(X_new)

    # Transform to UMAP space
    new_embedding = reducer.transform(X_new_processed)

    # Build JSON data
    json_data = []
    for idx, row in new_df.iterrows():
        point_data = {
            'id': int(idx),
            'x': float(new_embedding[idx][0]),
            'y': float(new_embedding[idx][1]),
            'risk': str(row['risk']) if 'risk' in row else 'unknown',
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

    # Save JSON
    with open(output_json_path, 'w') as f:
        json.dump(json_data, f, indent=2)

    print(f"\nSaved mapped UMAP data to '{output_json_path}'")
    print(f"Mapped data shape: {new_embedding.shape}")

if __name__ == "__main__":
    # Example usage
    input_csv = "new_german_credit_data.csv"  # Replace with your input CSV path
    output_json = "new_german_credit_umap.json"  # Replace with your desired output path
    map_new_data(input_csv, output_json)
