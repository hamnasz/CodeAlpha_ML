import { storage } from "../storage";
import { type InsertModel, type InsertVisualization, type Dataset, type Model } from "@shared/schema";
import { visualizationService } from "./visualization-service";

export interface MLTrainingResult {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rmse?: number;
  mae?: number;
  r2Score?: number;
  trainingTime: number;
  hyperparameters: Record<string, any>;
}

export class MLService {
  private readonly MODEL_TYPES = {
    classification: [
      'random_forest',
      'xgboost',
      'decision_tree',
      'logistic_regression'
    ],
    regression: [
      'random_forest_regressor',
      'xgboost_regressor',
      'decision_tree_regressor',
      'linear_regression'
    ]
  };

  async detectTaskType(data: any[]): Promise<'classification' | 'regression'> {
    // Simple heuristic: if target column has less than 20 unique values and contains strings/categories, it's classification
    if (data.length === 0) return 'classification';
    
    const targetColumn = Object.keys(data[0]).pop(); // Last column as target
    if (!targetColumn) return 'classification';
    
    const uniqueValues = new Set(data.map(row => row[targetColumn]));
    const hasStringValues = Array.from(uniqueValues).some(val => typeof val === 'string');
    
    if (hasStringValues || uniqueValues.size < 20) {
      return 'classification';
    }
    
    return 'regression';
  }

  async preprocessData(data: any[]): Promise<{
    cleanedData: any[];
    summary: {
      missingValuesHandled: number;
      categoricalEncoded: string[];
      numericalScaled: string[];
      featuresEngineered: string[];
    };
  }> {
    // Simulate preprocessing
    const summary = {
      missingValuesHandled: Math.floor(Math.random() * 10),
      categoricalEncoded: ['species', 'category'].filter(() => Math.random() > 0.5),
      numericalScaled: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'].filter(() => Math.random() > 0.3),
      featuresEngineered: ['length_width_ratio', 'petal_area'].filter(() => Math.random() > 0.7),
    };

    return {
      cleanedData: data,
      summary,
    };
  }

  async trainModel(
    datasetId: number,
    modelType: string,
    data: any[],
    taskType: 'classification' | 'regression'
  ): Promise<MLTrainingResult> {
    const startTime = Date.now();
    
    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const trainingTime = (Date.now() - startTime) / 1000;
    
    if (taskType === 'classification') {
      return {
        accuracy: 0.85 + Math.random() * 0.14,
        precision: 0.82 + Math.random() * 0.16,
        recall: 0.84 + Math.random() * 0.15,
        f1Score: 0.83 + Math.random() * 0.15,
        trainingTime,
        hyperparameters: this.generateHyperparameters(modelType),
      };
    } else {
      return {
        rmse: 0.1 + Math.random() * 0.5,
        mae: 0.05 + Math.random() * 0.3,
        r2Score: 0.75 + Math.random() * 0.24,
        trainingTime,
        hyperparameters: this.generateHyperparameters(modelType),
      };
    }
  }

  private generateHyperparameters(modelType: string): Record<string, any> {
    const hyperparams: Record<string, Record<string, any>> = {
      random_forest: {
        n_estimators: 100,
        max_depth: 10,
        min_samples_split: 2,
        min_samples_leaf: 1,
      },
      xgboost: {
        n_estimators: 100,
        max_depth: 6,
        learning_rate: 0.1,
        subsample: 0.8,
      },
      decision_tree: {
        max_depth: 5,
        min_samples_split: 2,
        min_samples_leaf: 1,
      },
      logistic_regression: {
        C: 1.0,
        max_iter: 100,
        solver: 'lbfgs',
      },
    };

    return hyperparams[modelType] || {};
  }

  async trainAllModels(datasetId: number): Promise<number> {
    const dataset = await storage.getDataset(datasetId);
    if (!dataset) throw new Error(`Dataset ${datasetId} not found`);

    // Create training job
    const trainingJob = await storage.createTrainingJob({
      datasetId,
      status: 'running',
      progress: 0,
      currentStep: 'initializing',
      totalSteps: 4,
    });

    // Start training in background
    this.runTrainingPipeline(trainingJob.id, dataset);

    return trainingJob.id;
  }

  private async runTrainingPipeline(jobId: number, dataset: Dataset): Promise<void> {
    try {
      // Get sample data for training
      const sampleData = this.generateSampleData(dataset);
      
      // Step 1: Preprocessing
      await storage.updateTrainingJob(jobId, {
        currentStep: 'preprocessing',
        progress: 0.25,
      });

      const { cleanedData, summary } = await this.preprocessData(sampleData);
      await storage.updateDataset(dataset.id, {
        preprocessed: true,
        preprocessingSummary: summary,
      });

      // Step 2: Model Training
      await storage.updateTrainingJob(jobId, {
        currentStep: 'training',
        progress: 0.5,
      });

      const modelTypes = this.MODEL_TYPES[dataset.taskType as keyof typeof this.MODEL_TYPES];
      const models: Model[] = [];

      for (let i = 0; i < modelTypes.length; i++) {
        const modelType = modelTypes[i];
        
        // Create model record
        const model = await storage.createModel({
          datasetId: dataset.id,
          modelType,
          status: 'training',
          progress: 0,
          hyperparameters: this.generateHyperparameters(modelType),
        });

        // Train the model
        const result = await this.trainModel(dataset.id, modelType, cleanedData, dataset.taskType as any);
        
        // Update model with results
        const updatedModel = await storage.updateModel(model.id, {
          status: 'completed',
          progress: 1,
          ...result,
        });

        models.push(updatedModel);

        // Generate visualizations
        await this.generateVisualizations(updatedModel, cleanedData);
      }

      // Step 3: Evaluation
      await storage.updateTrainingJob(jobId, {
        currentStep: 'evaluation',
        progress: 0.75,
      });

      // Find best model
      const bestModel = this.findBestModel(models, dataset.taskType as any);
      
      // Step 4: Completion
      await storage.updateTrainingJob(jobId, {
        status: 'completed',
        progress: 1,
        currentStep: 'completed',
        bestModelId: bestModel.id,
      });

    } catch (error) {
      await storage.updateTrainingJob(jobId, {
        status: 'failed',
        currentStep: 'failed',
      });
      throw error;
    }
  }

  private generateSampleData(dataset: Dataset): any[] {
    // Generate sample data based on dataset info
    const sampleData = [];
    const features = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'];
    const targets = ['setosa', 'versicolor', 'virginica'];

    for (let i = 0; i < Math.min(dataset.rows, 150); i++) {
      const row: any = {};
      
      features.forEach(feature => {
        row[feature] = (Math.random() * 3 + 4).toFixed(1);
      });
      
      if (dataset.taskType === 'classification') {
        row[dataset.targetColumn] = targets[Math.floor(Math.random() * targets.length)];
      } else {
        row[dataset.targetColumn] = (Math.random() * 10).toFixed(2);
      }
      
      sampleData.push(row);
    }

    return sampleData;
  }

  private async generateVisualizations(model: Model, data: any[]): Promise<void> {
    const dataset = await storage.getDataset(model.datasetId);
    if (!dataset) return;

    if (dataset.taskType === 'classification') {
      // Generate confusion matrix
      const confusionMatrix = visualizationService.generateConfusionMatrix(data, dataset.targetColumn);
      await storage.createVisualization({
        modelId: model.id,
        type: 'confusion_matrix',
        data: confusionMatrix,
      });

      // Generate ROC curve
      const rocCurve = visualizationService.generateROCCurve(data, dataset.targetColumn);
      await storage.createVisualization({
        modelId: model.id,
        type: 'roc_curve',
        data: rocCurve,
      });
    } else {
      // Generate residual plot
      const residualPlot = visualizationService.generateResidualPlot(data, dataset.targetColumn);
      await storage.createVisualization({
        modelId: model.id,
        type: 'residual_plot',
        data: residualPlot,
      });
    }

    // Generate feature importance
    const featureImportance = visualizationService.generateFeatureImportance(data, dataset.targetColumn);
    await storage.createVisualization({
      modelId: model.id,
      type: 'feature_importance',
      data: featureImportance,
    });
  }

  private findBestModel(models: Model[], taskType: 'classification' | 'regression'): Model {
    if (taskType === 'classification') {
      return models.reduce((best, current) => 
        (current.accuracy || 0) > (best.accuracy || 0) ? current : best
      );
    } else {
      return models.reduce((best, current) => 
        (current.r2Score || 0) > (best.r2Score || 0) ? current : best
      );
    }
  }
}

export const mlService = new MLService();
