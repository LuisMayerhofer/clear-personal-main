#!/usr/bin/env python3
"""
Orchestration script that runs after counterfactuals are generated.
This script:
1. Creates a joint dataset of training data, counterfactuals, and user data
2. Generates UMAP embeddings for all data
3. Copies the results to the assets folder for frontend access
"""

import subprocess
import sys
import os

def run_script(script_path, description):
    """Run a Python script and handle errors."""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Script: {script_path}")
    print('='*60)
    
    try:
        # Get the script directory
        script_dir = os.path.dirname(os.path.abspath(script_path))
        script_name = os.path.basename(script_path)
        
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=True, 
                              text=True, 
                              cwd=script_dir)
        
        if result.stdout:
            print("STDOUT:")
            print(result.stdout)
        
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
        
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ {description} failed with return code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error running {description}: {e}")
        return False

def main():
    """Main orchestration function."""
    print("🚀 Starting UMAP data generation pipeline...")
    
    # Get the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Step 1: Create joint dataset
    create_joint_script = os.path.join(script_dir, 'create_joint_dataset.py')
    success1 = run_script(create_joint_script, 'Joint dataset creation')
    
    if not success1:
        print("❌ Pipeline failed at joint dataset creation step")
        return False
    
    # Step 2: Generate UMAP embeddings
    umap_script = os.path.join(script_dir, 'generate_umap_with_counterfactuals.py')
    success2 = run_script(umap_script, 'UMAP embedding generation')
    
    if not success2:
        print("❌ Pipeline failed at UMAP generation step")
        return False
    
    print("\n🎉 Pipeline completed successfully!")
    print("✅ Joint dataset created")
    print("✅ UMAP embeddings generated")
    print("✅ Data copied to assets folder for frontend access")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
