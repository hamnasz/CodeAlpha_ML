import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
from utils.database_manager import DatabaseManager

st.set_page_config(page_title="Database Management", page_icon="🗄️", layout="wide")

def main():
    st.title("🗄️ Database Management")
    
    st.markdown("""
    Manage your stored datasets, trained models, and prediction history in the database.
    """)
    
    # Initialize database manager
    try:
        db_manager = DatabaseManager()
        if not db_manager.test_connection():
            st.error("❌ Failed to connect to database")
            return
        
        st.success("✅ Database connection successful")
    except Exception as e:
        st.error(f"❌ Database initialization failed: {str(e)}")
        return
    
    # Tabs for different database operations
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📊 Datasets", 
        "🤖 Models", 
        "📝 Predictions", 
        "⚙️ Pipelines",
        "🧹 Maintenance"
    ])
    
    with tab1:
        manage_datasets(db_manager)
    
    with tab2:
        manage_models(db_manager)
    
    with tab3:
        view_predictions(db_manager)
    
    with tab4:
        manage_pipelines(db_manager)
    
    with tab5:
        database_maintenance(db_manager)

def manage_datasets(db_manager):
    """Manage stored datasets"""
    st.header("📊 Dataset Management")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("Stored Datasets")
        
        try:
            datasets = db_manager.list_datasets()
            
            if datasets:
                # Create DataFrame for display
                df = pd.DataFrame(datasets)
                df['upload_date'] = pd.to_datetime(df['upload_date']).dt.strftime('%Y-%m-%d %H:%M')
                
                # Display datasets
                for idx, dataset in enumerate(datasets):
                    with st.expander(f"📊 {dataset['name']} (ID: {dataset['id']})"):
                        col_info1, col_info2, col_info3 = st.columns(3)
                        
                        with col_info1:
                            st.metric("Rows", dataset['num_rows'])
                        with col_info2:
                            st.metric("Columns", dataset['num_columns'])
                        with col_info3:
                            st.write(f"**Uploaded:** {dataset['upload_date']}")
                        
                        if dataset['description']:
                            st.write(f"**Description:** {dataset['description']}")
                        
                        col_btn1, col_btn2, col_btn3 = st.columns(3)
                        
                        with col_btn1:
                            if st.button(f"Load Dataset", key=f"load_{dataset['id']}"):
                                data, name, desc = db_manager.load_dataset(dataset['id'])
                                if data is not None:
                                    st.session_state.data = data
                                    st.success(f"✅ Dataset '{name}' loaded into session!")
                                    st.rerun()
                        
                        with col_btn2:
                            if st.button(f"Preview", key=f"preview_{dataset['id']}"):
                                data, _, _ = db_manager.load_dataset(dataset['id'])
                                if data is not None:
                                    st.dataframe(data.head(10), use_container_width=True)
                        
                        with col_btn3:
                            if st.button(f"🗑️ Delete", key=f"delete_{dataset['id']}", type="secondary"):
                                if db_manager.delete_dataset(dataset['id']):
                                    st.success("Dataset deleted!")
                                    st.rerun()
                                else:
                                    st.error("Failed to delete dataset")
            else:
                st.info("No datasets stored in database yet.")
                
        except Exception as e:
            st.error(f"Error loading datasets: {str(e)}")
    
    with col2:
        st.subheader("Save Current Dataset")
        
        if 'data' in st.session_state:
            st.info(f"Current dataset: {len(st.session_state.data)} rows, {len(st.session_state.data.columns)} columns")
            
            dataset_name = st.text_input("Dataset Name", placeholder="e.g., Credit_Data_2025")
            dataset_desc = st.text_area("Description (optional)", placeholder="Description of the dataset...")
            
            if st.button("💾 Save to Database", type="primary"):
                if dataset_name:
                    try:
                        dataset_id = db_manager.save_dataset(
                            st.session_state.data, 
                            dataset_name, 
                            dataset_desc
                        )
                        st.success(f"✅ Dataset saved with ID: {dataset_id}")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error saving dataset: {str(e)}")
                else:
                    st.warning("Please enter a dataset name")
        else:
            st.warning("No dataset loaded in current session")

def manage_models(db_manager):
    """Manage stored models"""
    st.header("🤖 Model Management")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("Stored Models")
        
        try:
            models = db_manager.list_models()
            
            if models:
                for model in models:
                    with st.expander(f"🤖 {model['model_name']} - {model['algorithm']} (ID: {model['id']})"):
                        col_metric1, col_metric2, col_metric3, col_metric4 = st.columns(4)
                        
                        with col_metric1:
                            st.metric("Accuracy", f"{model['accuracy']:.3f}" if model['accuracy'] else "N/A")
                        with col_metric2:
                            st.metric("ROC-AUC", f"{model['roc_auc']:.3f}" if model['roc_auc'] else "N/A")
                        with col_metric3:
                            st.metric("Precision", f"{model['precision']:.3f}" if model['precision'] else "N/A")
                        with col_metric4:
                            st.metric("Recall", f"{model['recall']:.3f}" if model['recall'] else "N/A")
                        
                        st.write(f"**Trained:** {model['training_date']}")
                        
                        col_btn1, col_btn2 = st.columns(2)
                        
                        with col_btn1:
                            if st.button(f"Load Model", key=f"load_model_{model['id']}"):
                                try:
                                    loaded_model, metadata = db_manager.load_model(model['id'])
                                    if loaded_model is not None:
                                        # Store in session state
                                        if 'trained_models' not in st.session_state:
                                            st.session_state.trained_models = {}
                                        
                                        st.session_state.trained_models[model['model_name']] = {
                                            'model': loaded_model,
                                            'metadata': metadata
                                        }
                                        st.success(f"✅ Model '{model['model_name']}' loaded into session!")
                                except Exception as e:
                                    st.error(f"Error loading model: {str(e)}")
                        
                        with col_btn2:
                            if st.button(f"🗑️ Delete", key=f"delete_model_{model['id']}", type="secondary"):
                                if db_manager.delete_model(model['id']):
                                    st.success("Model deleted!")
                                    st.rerun()
                                else:
                                    st.error("Failed to delete model")
            else:
                st.info("No models stored in database yet.")
                
        except Exception as e:
            st.error(f"Error loading models: {str(e)}")
    
    with col2:
        st.subheader("Save Current Models")
        
        if 'trained_models' in st.session_state and st.session_state.trained_models:
            st.info(f"Current session has {len(st.session_state.trained_models)} trained models")
            
            model_to_save = st.selectbox(
                "Select Model to Save",
                list(st.session_state.trained_models.keys())
            )
            
            if model_to_save and st.button("💾 Save Model to Database", type="primary"):
                try:
                    model_data = st.session_state.trained_models[model_to_save]
                    model = model_data['model']
                    
                    # Get metrics from model results if available
                    metrics = {}
                    if 'model_results' in st.session_state:
                        for model_name, results in st.session_state.model_results.items():
                            if model_name == model_to_save:
                                metrics = {
                                    'accuracy': results.get('test_accuracy', 0),
                                    'roc_auc': results.get('test_roc_auc', 0),
                                    'precision': results.get('test_precision', 0),
                                    'recall': results.get('test_recall', 0),
                                    'f1_score': results.get('test_f1', 0)
                                }
                                break
                    
                    # Get feature names if available
                    feature_names = None
                    if 'engineered_data' in st.session_state:
                        feature_names = list(st.session_state.engineered_data.columns)
                    
                    model_id = db_manager.save_model(
                        model=model,
                        model_name=model_to_save,
                        algorithm=model.__class__.__name__,
                        metrics=metrics,
                        feature_names=feature_names
                    )
                    st.success(f"✅ Model saved with ID: {model_id}")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error saving model: {str(e)}")
        else:
            st.warning("No trained models in current session")

def view_predictions(db_manager):
    """View prediction history"""
    st.header("📝 Prediction History")
    
    col1, col2 = st.columns([3, 1])
    
    with col2:
        st.subheader("Filters")
        
        # Get available models for filtering
        try:
            models = db_manager.list_models()
            model_options = ["All Models"] + [f"{m['model_name']} (ID: {m['id']})" for m in models]
            selected_model = st.selectbox("Filter by Model", model_options)
            
            limit = st.slider("Number of Records", 10, 500, 100)
            
            model_id_filter = None
            if selected_model != "All Models":
                # Extract model ID from selection
                model_id_filter = int(selected_model.split("ID: ")[1].split(")")[0])
            
        except Exception as e:
            st.error(f"Error loading models for filter: {str(e)}")
            model_id_filter = None
            limit = 100
    
    with col1:
        st.subheader("Recent Predictions")
        
        try:
            predictions = db_manager.get_prediction_history(model_id=model_id_filter, limit=limit)
            
            if predictions:
                # Convert to DataFrame for better display
                df = pd.DataFrame(predictions)
                df['prediction_date'] = pd.to_datetime(df['prediction_date']).dt.strftime('%Y-%m-%d %H:%M:%S')
                
                # Display summary metrics
                col_metric1, col_metric2, col_metric3 = st.columns(3)
                
                with col_metric1:
                    st.metric("Total Predictions", len(predictions))
                
                with col_metric2:
                    avg_prob = sum(p['probability'] for p in predictions) / len(predictions)
                    st.metric("Avg Probability", f"{avg_prob:.3f}")
                
                with col_metric3:
                    high_risk_count = sum(1 for p in predictions if p['risk_category'] == 'High Risk')
                    st.metric("High Risk %", f"{100 * high_risk_count / len(predictions):.1f}%")
                
                # Display prediction table
                st.dataframe(
                    df[['prediction_date', 'model_id', 'prediction', 'probability', 'risk_category']], 
                    use_container_width=True
                )
                
                # Visualizations
                st.subheader("📊 Prediction Analytics")
                
                col_viz1, col_viz2 = st.columns(2)
                
                with col_viz1:
                    # Risk distribution
                    risk_counts = df['risk_category'].value_counts()
                    fig = px.pie(
                        values=risk_counts.values, 
                        names=risk_counts.index,
                        title="Risk Category Distribution"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                
                with col_viz2:
                    # Prediction timeline
                    df['date'] = pd.to_datetime(df['prediction_date']).dt.date
                    daily_counts = df.groupby('date').size().reset_index(name='count')
                    fig = px.line(
                        daily_counts, 
                        x='date', 
                        y='count',
                        title="Daily Prediction Volume"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                
            else:
                st.info("No predictions found in the database.")
                
        except Exception as e:
            st.error(f"Error loading predictions: {str(e)}")

def manage_pipelines(db_manager):
    """Manage processing pipelines"""
    st.header("⚙️ Processing Pipeline Management")
    
    st.info("Pipeline management functionality can be extended based on your preprocessing requirements.")
    
    try:
        # For now, just show the table structure
        st.subheader("Pipeline Storage Schema")
        st.markdown("""
        The database stores preprocessing pipelines with:
        - Pipeline name and description
        - Processing steps configuration
        - Serialized transformation objects
        - Creation timestamps
        """)
        
    except Exception as e:
        st.error(f"Error in pipeline management: {str(e)}")

def database_maintenance(db_manager):
    """Database maintenance operations"""
    st.header("🧹 Database Maintenance")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Database Statistics")
        
        try:
            datasets = db_manager.list_datasets()
            models = db_manager.list_models()
            predictions = db_manager.get_prediction_history(limit=1000)
            
            st.metric("Total Datasets", len(datasets))
            st.metric("Total Models", len(models))
            st.metric("Recent Predictions", len(predictions))
            
        except Exception as e:
            st.error(f"Error getting database stats: {str(e)}")
    
    with col2:
        st.subheader("Cleanup Operations")
        
        st.warning("⚠️ These operations cannot be undone!")
        
        days_old = st.slider("Clean predictions older than (days)", 7, 365, 30)
        
        if st.button("🧹 Clean Old Predictions", type="secondary"):
            try:
                deleted_count = db_manager.cleanup_old_data(days_old)
                st.success(f"✅ Deleted {deleted_count} old prediction records")
            except Exception as e:
                st.error(f"Error cleaning data: {str(e)}")
        
        st.markdown("---")
        
        if st.button("🔄 Test Database Connection", type="primary"):
            if db_manager.test_connection():
                st.success("✅ Database connection is healthy")
            else:
                st.error("❌ Database connection failed")

if __name__ == "__main__":
    main()