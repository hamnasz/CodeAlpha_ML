import sys
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, roc_curve
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
import time
import os
import joblib

warnings.filterwarnings('ignore')

def log_output(data):
    """Print JSON output for communication with Node.js"""
    print(json.dumps(data))
    sys.stdout.flush()

def analyze_data(file_path, project_id):
    """Analyze uploaded dataset and perform feature engineering"""
    try:
        # Read the dataset
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")
        
        # Basic data analysis
        total_records = len(df)
        features = len(df.columns)
        missing_values = df.isnull().sum().sum()
        
        # Feature engineering
        df_processed = df.copy()
        
        # Calculate Debt-to-Income Ratio if relevant columns exist
        if 'debt_payments' in df.columns and 'income' in df.columns:
            df_processed['debt_to_income_ratio'] = df['debt_payments'] / df['income']
            log_output({
                'type': 'feature_engineering',
                'feature': 'debt_to_income_ratio',
                'status': 'completed'
            })
        
        # Calculate Credit Utilization Rate if relevant columns exist
        if 'credit_used' in df.columns and 'credit_limit' in df.columns:
            df_processed['credit_utilization_rate'] = df['credit_used'] / df['credit_limit']
            log_output({
                'type': 'feature_engineering',
                'feature': 'credit_utilization_rate',
                'status': 'completed'
            })
        
        # Calculate Average Payment Delays if relevant columns exist
        payment_delay_cols = [col for col in df.columns if 'payment_delay' in col.lower()]
        if payment_delay_cols:
            df_processed['avg_payment_delays'] = df[payment_delay_cols].mean(axis=1)
            log_output({
                'type': 'feature_engineering',
                'feature': 'avg_payment_delays',
                'status': 'completed'
            })
        
        # Determine target variable (common names for credit scoring)
        target_col = None
        potential_targets = ['default', 'target', 'bad_loan', 'delinquent', 'class']
        for col in df.columns:
            if col.lower() in potential_targets:
                target_col = col
                break
        
        if target_col:
            default_rate = df[target_col].mean() * 100
        else:
            default_rate = 0
        
        # Data quality assessment
        completeness = (1 - missing_values / (total_records * features)) * 100
        if completeness > 95:
            data_quality = "Excellent"
        elif completeness > 85:
            data_quality = "Good"
        elif completeness > 70:
            data_quality = "Fair"
        else:
            data_quality = "Poor"
        
        # Save processed data
        processed_file = f"server/uploads/processed_{project_id}.csv"
        df_processed.to_csv(processed_file, index=False)
        
        # Output dataset summary
        log_output({
            'type': 'dataset_summary',
            'data': {
                'totalRecords': total_records,
                'features': features,
                'missingValues': missing_values,
                'defaultRate': default_rate,
                'dataQuality': data_quality,
                'summary': {
                    'columns': list(df.columns),
                    'dtypes': df.dtypes.astype(str).to_dict(),
                    'numerical_cols': df.select_dtypes(include=[np.number]).columns.tolist(),
                    'categorical_cols': df.select_dtypes(include=['object']).columns.tolist(),
                    'target_column': target_col
                }
            }
        })
        
        return df_processed, target_col
        
    except Exception as e:
        log_output({
            'type': 'error',
            'message': f"Error analyzing data: {str(e)}"
        })
        return None, None

def train_models(file_path, project_id):
    """Train multiple credit scoring models"""
    try:
        # Load processed data
        processed_file = f"server/uploads/processed_{project_id}.csv"
        if os.path.exists(processed_file):
            df = pd.read_csv(processed_file)
        else:
            df, target_col = analyze_data(file_path, project_id)
            if df is None:
                return
        
        # Determine target column
        target_col = None
        potential_targets = ['default', 'target', 'bad_loan', 'delinquent', 'class']
        for col in df.columns:
            if col.lower() in potential_targets:
                target_col = col
                break
        
        if not target_col:
            log_output({
                'type': 'error',
                'message': "No target column found for training"
            })
            return
        
        # Prepare features and target
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        # Handle categorical variables
        categorical_cols = X.select_dtypes(include=['object']).columns
        label_encoders = {}
        
        for col in categorical_cols:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Define models and their hyperparameters
        models = {
            'logistic_regression': {
                'model': LogisticRegression(random_state=42),
                'params': {
                    'C': [0.1, 1, 10],
                    'penalty': ['l1', 'l2'],
                    'solver': ['liblinear']
                }
            },
            'decision_tree': {
                'model': DecisionTreeClassifier(random_state=42),
                'params': {
                    'max_depth': [3, 5, 10, None],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
            },
            'random_forest': {
                'model': RandomForestClassifier(random_state=42),
                'params': {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [3, 5, 10, None],
                    'min_samples_split': [2, 5, 10]
                }
            }
        }
        
        best_model = None
        best_score = 0
        results = {}
        
        for model_name, model_config in models.items():
            log_output({
                'type': 'model_update',
                'data': {
                    'modelType': model_name,
                    'status': 'training',
                    'progress': 0
                }
            })
            
            start_time = time.time()
            
            # Hyperparameter tuning
            grid_search = GridSearchCV(
                model_config['model'],
                model_config['params'],
                cv=3,
                scoring='roc_auc',
                n_jobs=-1
            )
            
            if model_name == 'logistic_regression':
                grid_search.fit(X_train_scaled, y_train)
                X_test_model = X_test_scaled
            else:
                grid_search.fit(X_train, y_train)
                X_test_model = X_test
            
            # Get best model
            best_model_instance = grid_search.best_estimator_
            
            # Make predictions
            y_pred = best_model_instance.predict(X_test_model)
            y_pred_proba = best_model_instance.predict_proba(X_test_model)[:, 1]
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, average='weighted')
            recall = recall_score(y_test, y_pred, average='weighted')
            f1 = f1_score(y_test, y_pred, average='weighted')
            roc_auc = roc_auc_score(y_test, y_pred_proba)
            
            training_time = int((time.time() - start_time) * 1000)  # milliseconds
            
            # Get feature importance
            feature_importance = None
            if hasattr(best_model_instance, 'feature_importances_'):
                feature_importance = {
                    'features': X.columns.tolist(),
                    'importance': best_model_instance.feature_importances_.tolist()
                }
            elif hasattr(best_model_instance, 'coef_'):
                feature_importance = {
                    'features': X.columns.tolist(),
                    'importance': np.abs(best_model_instance.coef_[0]).tolist()
                }
            
            # Save model
            model_file = f"server/uploads/model_{project_id}_{model_name}.joblib"
            joblib.dump(best_model_instance, model_file)
            
            results[model_name] = {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1': f1,
                'roc_auc': roc_auc,
                'y_pred_proba': y_pred_proba.tolist(),
                'y_test': y_test.tolist()
            }
            
            # Check if this is the best model
            if roc_auc > best_score:
                best_score = roc_auc
                best_model = model_name
            
            log_output({
                'type': 'model_update',
                'data': {
                    'modelType': model_name,
                    'status': 'completed',
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1Score': f1,
                    'rocAuc': roc_auc,
                    'featureImportance': feature_importance,
                    'hyperparameters': grid_search.best_params_,
                    'trainingTime': training_time
                }
            })
        
        # Generate ROC curve data
        roc_data = {}
        for model_name, result in results.items():
            fpr, tpr, _ = roc_curve(result['y_test'], result['y_pred_proba'])
            roc_data[model_name] = {
                'fpr': fpr.tolist(),
                'tpr': tpr.tolist(),
                'auc': result['roc_auc']
            }
        
        log_output({
            'type': 'roc_data',
            'data': roc_data
        })
        
        log_output({
            'type': 'best_model',
            'data': {
                'modelType': best_model,
                'score': best_score
            }
        })
        
    except Exception as e:
        log_output({
            'type': 'error',
            'message': f"Error training models: {str(e)}"
        })

def main():
    if len(sys.argv) < 4:
        print("Usage: python credit_scoring.py <command> <file_path> <project_id>")
        return
    
    command = sys.argv[1]
    file_path = sys.argv[2]
    project_id = sys.argv[3]
    
    if command == 'analyze':
        analyze_data(file_path, project_id)
    elif command == 'train':
        train_models(file_path, project_id)
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
