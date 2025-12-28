import pandas as pd
import os

def create_joint_dataset():
    """
    Creates a joint dataset combining training data, counterfactuals, and user data.
    Each row is labeled with its source: 0=training, 1=counterfactual, 2=user
    """
    
    # Get the script directory and construct paths relative to project structure
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))  # Go up two levels to project root
    
    # Paths to the data files
    training_data_path = os.path.join(script_dir, '../r-server/data/german_credit_data_with_predictions.csv')
    counterfactuals_path = os.path.join(script_dir, '../r-server/results/results.csv')
    user_data_path = os.path.join(script_dir, '../r-server/results/user.csv')
    joint_output_path = os.path.join(script_dir, 'joint_credit_data.csv')
    
    print(f"Script directory: {script_dir}")
    print(f"Training data path: {training_data_path}")
    print(f"Counterfactuals path: {counterfactuals_path}")
    print(f"User data path: {user_data_path}")
    print(f"Joint output path: {joint_output_path}")
    
    # Check if all required files exist
    missing_files = []
    if not os.path.exists(training_data_path):
        missing_files.append(training_data_path)
    if not os.path.exists(counterfactuals_path):
        missing_files.append(counterfactuals_path)
    if not os.path.exists(user_data_path):
        missing_files.append(user_data_path)
    
    if missing_files:
        print(f"Error: Missing required files: {missing_files}")
        return False
    
    try:
        # Load training data
        print("Loading training data...")
        training_df = pd.read_csv(training_data_path)
        # Remove the index column if it exists
        if training_df.columns[0] == 'Unnamed: 0' or training_df.columns[0] == '':
            training_df = training_df.drop(training_df.columns[0], axis=1)
        training_df['counterfactual'] = 0  # 0 = training data
        print(f"Training data loaded: {len(training_df)} rows")
        
        # Load counterfactuals
        print("Loading counterfactuals...")
        counterfactuals_df = pd.read_csv(counterfactuals_path)
        counterfactuals_df['counterfactual'] = 1  # 1 = counterfactual data
        print(f"Counterfactuals loaded: {len(counterfactuals_df)} rows")
        
        # Load user data
        print("Loading user data...")
        user_df = pd.read_csv(user_data_path)
        user_df['counterfactual'] = 2  # 2 = user data
        print(f"User data loaded: {len(user_df)} rows")
        
        # Normalize column names for consistency
        def normalize_columns(df):
            df.columns = [col.lower() for col in df.columns]
            # Handle specific column name variations
            df.columns = df.columns.str.replace('saving.accounts', 'saving accounts')
            df.columns = df.columns.str.replace('checking.account', 'checking account')
            df.columns = df.columns.str.replace('credit.amount', 'credit amount')
            return df
        
        training_df = normalize_columns(training_df)
        counterfactuals_df = normalize_columns(counterfactuals_df)
        user_df = normalize_columns(user_df)
        
        # Ensure all dataframes have the same columns
        print("Column alignment check...")
        print(f"Training columns: {list(training_df.columns)}")
        print(f"Counterfactuals columns: {list(counterfactuals_df.columns)}")
        print(f"User columns: {list(user_df.columns)}")
        
        # Get all unique columns
        all_columns = set(training_df.columns) | set(counterfactuals_df.columns) | set(user_df.columns)
        
        # Add missing columns with NaN values
        for col in all_columns:
            if col not in training_df.columns:
                training_df[col] = None
            if col not in counterfactuals_df.columns:
                counterfactuals_df[col] = None
            if col not in user_df.columns:
                user_df[col] = None
        
        # Reorder columns to match
        column_order = sorted(all_columns)
        training_df = training_df[column_order]
        counterfactuals_df = counterfactuals_df[column_order]
        user_df = user_df[column_order]
        
        # Combine all datasets
        print("Combining datasets...")
        joint_df = pd.concat([training_df, counterfactuals_df, user_df], ignore_index=True)
        
        # Save the joint dataset
        joint_df.to_csv(joint_output_path, index=False)
        print(f"Joint dataset saved to {joint_output_path}")
        print(f"Total rows: {len(joint_df)}")
        print(f"Training data: {len(training_df)} rows")
        print(f"Counterfactual data: {len(counterfactuals_df)} rows") 
        print(f"User data: {len(user_df)} rows")
        
        # Display the distribution
        print("\nData distribution:")
        distribution = joint_df['counterfactual'].value_counts().sort_index()
        for idx, count in distribution.items():
            data_type = {0: 'Training', 1: 'Counterfactual', 2: 'User'}[idx]
            print(f"  {data_type}: {count} rows")
        
        return True
        
    except Exception as e:
        print(f"Error creating joint dataset: {e}")
        return False

if __name__ == "__main__":
    success = create_joint_dataset()
    if success:
        print("Joint dataset creation completed successfully!")
    else:
        print("Joint dataset creation failed!")
