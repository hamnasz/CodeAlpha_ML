import os
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text, MetaData, Table, Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import pickle
import base64
from datetime import datetime
import json

Base = declarative_base()

class DatasetStorage(Base):
    """Table for storing uploaded datasets"""
    __tablename__ = 'datasets'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    upload_date = Column(DateTime, default=datetime.utcnow)
    file_size = Column(Integer)
    num_rows = Column(Integer)
    num_columns = Column(Integer)
    data_json = Column(Text)  # JSON representation of the data
    
class ModelStorage(Base):
    """Table for storing trained models"""
    __tablename__ = 'models'
    
    id = Column(Integer, primary_key=True)
    model_name = Column(String(255), nullable=False)
    algorithm = Column(String(100), nullable=False)
    dataset_id = Column(Integer)
    training_date = Column(DateTime, default=datetime.utcnow)
    accuracy = Column(Float)
    roc_auc = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    model_data = Column(Text)  # Base64 encoded pickled model
    hyperparameters = Column(Text)  # JSON encoded parameters
    feature_names = Column(Text)  # JSON encoded feature list
    
class ProcessingPipeline(Base):
    """Table for storing preprocessing pipelines"""
    __tablename__ = 'processing_pipelines'
    
    id = Column(Integer, primary_key=True)
    pipeline_name = Column(String(255), nullable=False)
    dataset_id = Column(Integer)
    processing_steps = Column(Text)  # JSON encoded steps
    pipeline_data = Column(Text)  # Base64 encoded pickled pipeline
    created_date = Column(DateTime, default=datetime.utcnow)

class PredictionLog(Base):
    """Table for logging predictions"""
    __tablename__ = 'prediction_logs'
    
    id = Column(Integer, primary_key=True)
    model_id = Column(Integer)
    prediction_date = Column(DateTime, default=datetime.utcnow)
    input_features = Column(Text)  # JSON encoded features
    prediction = Column(Float)
    probability = Column(Float)
    risk_category = Column(String(50))

class DatabaseManager:
    """
    Database manager for the credit scoring platform.
    Handles data storage, model persistence, and prediction logging.
    """
    
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL')
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable not found")
        
        self.engine = create_engine(self.database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.metadata = MetaData()
        
        # Create tables
        self.create_tables()
    
    def create_tables(self):
        """Create all database tables"""
        try:
            Base.metadata.create_all(bind=self.engine)
            return True
        except SQLAlchemyError as e:
            print(f"Error creating tables: {e}")
            return False
    
    def get_session(self):
        """Get database session"""
        return self.SessionLocal()
    
    def test_connection(self):
        """Test database connection"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                return True
        except Exception as e:
            print(f"Database connection failed: {e}")
            return False
    
    # Dataset operations
    def save_dataset(self, data, name, description=""):
        """Save dataset to database"""
        session = self.get_session()
        try:
            # Convert DataFrame to JSON
            data_json = data.to_json(orient='records')
            
            dataset = DatasetStorage(
                name=name,
                description=description,
                file_size=len(data_json),
                num_rows=len(data),
                num_columns=len(data.columns),
                data_json=data_json
            )
            
            session.add(dataset)
            session.commit()
            dataset_id = dataset.id
            session.close()
            return dataset_id
        except Exception as e:
            session.rollback()
            session.close()
            raise e
    
    def load_dataset(self, dataset_id):
        """Load dataset from database"""
        session = self.get_session()
        try:
            dataset = session.query(DatasetStorage).filter(DatasetStorage.id == dataset_id).first()
            if dataset:
                data = pd.read_json(dataset.data_json, orient='records')
                session.close()
                return data, dataset.name, dataset.description
            session.close()
            return None, None, None
        except Exception as e:
            session.close()
            raise e
    
    def list_datasets(self):
        """List all stored datasets"""
        session = self.get_session()
        try:
            datasets = session.query(DatasetStorage).all()
            result = []
            for dataset in datasets:
                result.append({
                    'id': dataset.id,
                    'name': dataset.name,
                    'description': dataset.description,
                    'upload_date': dataset.upload_date,
                    'num_rows': dataset.num_rows,
                    'num_columns': dataset.num_columns
                })
            session.close()
            return result
        except Exception as e:
            session.close()
            raise e
    
    def delete_dataset(self, dataset_id):
        """Delete dataset from database"""
        session = self.get_session()
        try:
            dataset = session.query(DatasetStorage).filter(DatasetStorage.id == dataset_id).first()
            if dataset:
                session.delete(dataset)
                session.commit()
                session.close()
                return True
            session.close()
            return False
        except Exception as e:
            session.rollback()
            session.close()
            raise e
    
    # Model operations
    def save_model(self, model, model_name, algorithm, metrics, hyperparameters=None, feature_names=None, dataset_id=None):
        """Save trained model to database"""
        session = self.get_session()
        try:
            # Serialize model
            model_bytes = pickle.dumps(model)
            model_b64 = base64.b64encode(model_bytes).decode('utf-8')
            
            model_record = ModelStorage(
                model_name=model_name,
                algorithm=algorithm,
                dataset_id=dataset_id,
                accuracy=metrics.get('accuracy'),
                roc_auc=metrics.get('roc_auc'),
                precision=metrics.get('precision'),
                recall=metrics.get('recall'),
                f1_score=metrics.get('f1_score'),
                model_data=model_b64,
                hyperparameters=json.dumps(hyperparameters) if hyperparameters else None,
                feature_names=json.dumps(feature_names) if feature_names else None
            )
            
            session.add(model_record)
            session.commit()
            model_id = model_record.id
            session.close()
            return model_id
        except Exception as e:
            session.rollback()
            session.close()
            raise e
    
    def load_model(self, model_id):
        """Load trained model from database"""
        session = self.get_session()
        try:
            model_record = session.query(ModelStorage).filter(ModelStorage.id == model_id).first()
            if model_record:
                # Deserialize model
                model_bytes = base64.b64decode(model_record.model_data.encode('utf-8'))
                model = pickle.loads(model_bytes)
                
                metadata = {
                    'model_name': model_record.model_name,
                    'algorithm': model_record.algorithm,
                    'training_date': model_record.training_date,
                    'metrics': {
                        'accuracy': model_record.accuracy,
                        'roc_auc': model_record.roc_auc,
                        'precision': model_record.precision,
                        'recall': model_record.recall,
                        'f1_score': model_record.f1_score
                    },
                    'hyperparameters': json.loads(model_record.hyperparameters) if model_record.hyperparameters else None,
                    'feature_names': json.loads(model_record.feature_names) if model_record.feature_names else None
                }
                
                session.close()
                return model, metadata
            session.close()
            return None, None
        except Exception as e:
            session.close()
            raise e
    
    def list_models(self):
        """List all stored models"""
        session = self.get_session()
        try:
            models = session.query(ModelStorage).all()
            result = []
            for model in models:
                result.append({
                    'id': model.id,
                    'model_name': model.model_name,
                    'algorithm': model.algorithm,
                    'training_date': model.training_date,
                    'accuracy': model.accuracy,
                    'roc_auc': model.roc_auc,
                    'precision': model.precision,
                    'recall': model.recall,
                    'f1_score': model.f1_score
                })
            session.close()
            return result
        except Exception as e:
            session.close()
            raise e
    
    def delete_model(self, model_id):
        """Delete model from database"""
        session = self.get_session()
        try:
            model = session.query(ModelStorage).filter(ModelStorage.id == model_id).first()
            if model:
                session.delete(model)
                session.commit()
                session.close()
                return True
            session.close()
            return False
        except Exception as e:
            session.rollback()
            session.close()
            raise e
    
    # Prediction logging
    def log_prediction(self, model_id, input_features, prediction, probability, risk_category):
        """Log a prediction for audit trail"""
        session = self.get_session()
        try:
            log_entry = PredictionLog(
                model_id=model_id,
                input_features=json.dumps(input_features),
                prediction=float(prediction),
                probability=float(probability),
                risk_category=risk_category
            )
            
            session.add(log_entry)
            session.commit()
            log_id = log_entry.id
            session.close()
            return log_id
        except Exception as e:
            session.rollback()
            session.close()
            raise e
    
    def get_prediction_history(self, model_id=None, limit=100):
        """Get prediction history"""
        session = self.get_session()
        try:
            query = session.query(PredictionLog)
            if model_id:
                query = query.filter(PredictionLog.model_id == model_id)
            
            predictions = query.order_by(PredictionLog.prediction_date.desc()).limit(limit).all()
            result = []
            for pred in predictions:
                result.append({
                    'id': pred.id,
                    'model_id': pred.model_id,
                    'prediction_date': pred.prediction_date,
                    'input_features': json.loads(pred.input_features),
                    'prediction': pred.prediction,
                    'probability': pred.probability,
                    'risk_category': pred.risk_category
                })
            session.close()
            return result
        except Exception as e:
            session.close()
            raise e
    
    # Processing pipeline operations
    def save_processing_pipeline(self, pipeline, pipeline_name, processing_steps, dataset_id=None):
        """Save preprocessing pipeline"""
        session = self.get_session()
        try:
            # Serialize pipeline
            pipeline_bytes = pickle.dumps(pipeline)
            pipeline_b64 = base64.b64encode(pipeline_bytes).decode('utf-8')
            
            pipeline_record = ProcessingPipeline(
                pipeline_name=pipeline_name,
                dataset_id=dataset_id,
                processing_steps=json.dumps(processing_steps),
                pipeline_data=pipeline_b64
            )
            
            session.add(pipeline_record)
            session.commit()
            pipeline_id = pipeline_record.id
            session.close()
            return pipeline_id
        except Exception as e:
            session.rollback()
            session.close()
            raise e
    
    def load_processing_pipeline(self, pipeline_id):
        """Load preprocessing pipeline"""
        session = self.get_session()
        try:
            pipeline_record = session.query(ProcessingPipeline).filter(ProcessingPipeline.id == pipeline_id).first()
            if pipeline_record:
                # Deserialize pipeline
                pipeline_bytes = base64.b64decode(pipeline_record.pipeline_data.encode('utf-8'))
                pipeline = pickle.loads(pipeline_bytes)
                
                metadata = {
                    'pipeline_name': pipeline_record.pipeline_name,
                    'processing_steps': json.loads(pipeline_record.processing_steps),
                    'created_date': pipeline_record.created_date
                }
                
                session.close()
                return pipeline, metadata
            session.close()
            return None, None
        except Exception as e:
            session.close()
            raise e
    
    def cleanup_old_data(self, days_old=30):
        """Clean up old prediction logs"""
        session = self.get_session()
        try:
            cutoff_date = datetime.utcnow() - pd.Timedelta(days=days_old)
            deleted = session.query(PredictionLog).filter(PredictionLog.prediction_date < cutoff_date).delete()
            session.commit()
            session.close()
            return deleted
        except Exception as e:
            session.rollback()
            session.close()
            raise e