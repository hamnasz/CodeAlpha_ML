import { 
  datasets, 
  models, 
  visualizations, 
  trainingJobs,
  type Dataset, 
  type InsertDataset,
  type Model,
  type InsertModel,
  type Visualization,
  type InsertVisualization,
  type TrainingJob,
  type InsertTrainingJob,
  type DatasetPreview,
  type ModelComparison,
  type TrainingProgress
} from "@shared/schema";

export interface IStorage {
  // Dataset operations
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  getDataset(id: number): Promise<Dataset | undefined>;
  getAllDatasets(): Promise<Dataset[]>;
  updateDataset(id: number, updates: Partial<Dataset>): Promise<Dataset>;
  
  // Model operations
  createModel(model: InsertModel): Promise<Model>;
  getModel(id: number): Promise<Model | undefined>;
  getModelsByDataset(datasetId: number): Promise<Model[]>;
  updateModel(id: number, updates: Partial<Model>): Promise<Model>;
  
  // Visualization operations
  createVisualization(visualization: InsertVisualization): Promise<Visualization>;
  getVisualizationsByModel(modelId: number): Promise<Visualization[]>;
  
  // Training job operations
  createTrainingJob(job: InsertTrainingJob): Promise<TrainingJob>;
  getTrainingJob(id: number): Promise<TrainingJob | undefined>;
  updateTrainingJob(id: number, updates: Partial<TrainingJob>): Promise<TrainingJob>;
  
  // Data preview
  getDatasetPreview(datasetId: number, page: number, pageSize: number): Promise<DatasetPreview>;
  
  // Model comparison
  getModelComparison(datasetId: number): Promise<ModelComparison[]>;
  
  // Training progress
  getTrainingProgress(jobId: number): Promise<TrainingProgress>;
}

export class MemStorage implements IStorage {
  private datasets: Map<number, Dataset> = new Map();
  private models: Map<number, Model> = new Map();
  private visualizations: Map<number, Visualization> = new Map();
  private trainingJobs: Map<number, TrainingJob> = new Map();
  private datasetData: Map<number, any[]> = new Map(); // Store actual dataset rows
  
  private currentDatasetId = 1;
  private currentModelId = 1;
  private currentVisualizationId = 1;
  private currentTrainingJobId = 1;

  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const id = this.currentDatasetId++;
    const dataset: Dataset = {
      ...insertDataset,
      id,
      uploadedAt: new Date(),
    };
    this.datasets.set(id, dataset);
    return dataset;
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }

  async getAllDatasets(): Promise<Dataset[]> {
    return Array.from(this.datasets.values());
  }

  async updateDataset(id: number, updates: Partial<Dataset>): Promise<Dataset> {
    const dataset = this.datasets.get(id);
    if (!dataset) throw new Error(`Dataset ${id} not found`);
    
    const updatedDataset = { ...dataset, ...updates };
    this.datasets.set(id, updatedDataset);
    return updatedDataset;
  }

  async createModel(insertModel: InsertModel): Promise<Model> {
    const id = this.currentModelId++;
    const model: Model = {
      ...insertModel,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.models.set(id, model);
    return model;
  }

  async getModel(id: number): Promise<Model | undefined> {
    return this.models.get(id);
  }

  async getModelsByDataset(datasetId: number): Promise<Model[]> {
    return Array.from(this.models.values()).filter(m => m.datasetId === datasetId);
  }

  async updateModel(id: number, updates: Partial<Model>): Promise<Model> {
    const model = this.models.get(id);
    if (!model) throw new Error(`Model ${id} not found`);
    
    const updatedModel = { ...model, ...updates };
    if (updates.status === 'completed' && !updatedModel.completedAt) {
      updatedModel.completedAt = new Date();
    }
    this.models.set(id, updatedModel);
    return updatedModel;
  }

  async createVisualization(insertVisualization: InsertVisualization): Promise<Visualization> {
    const id = this.currentVisualizationId++;
    const visualization: Visualization = {
      ...insertVisualization,
      id,
      createdAt: new Date(),
    };
    this.visualizations.set(id, visualization);
    return visualization;
  }

  async getVisualizationsByModel(modelId: number): Promise<Visualization[]> {
    return Array.from(this.visualizations.values()).filter(v => v.modelId === modelId);
  }

  async createTrainingJob(insertJob: InsertTrainingJob): Promise<TrainingJob> {
    const id = this.currentTrainingJobId++;
    const job: TrainingJob = {
      ...insertJob,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.trainingJobs.set(id, job);
    return job;
  }

  async getTrainingJob(id: number): Promise<TrainingJob | undefined> {
    return this.trainingJobs.get(id);
  }

  async updateTrainingJob(id: number, updates: Partial<TrainingJob>): Promise<TrainingJob> {
    const job = this.trainingJobs.get(id);
    if (!job) throw new Error(`Training job ${id} not found`);
    
    const updatedJob = { ...job, ...updates };
    if (updates.status === 'completed' && !updatedJob.completedAt) {
      updatedJob.completedAt = new Date();
    }
    this.trainingJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getDatasetPreview(datasetId: number, page: number, pageSize: number): Promise<DatasetPreview> {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) throw new Error(`Dataset ${datasetId} not found`);
    
    const data = this.datasetData.get(datasetId) || [];
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      headers: data.length > 0 ? Object.keys(data[0]) : [],
      rows: data.slice(startIndex, endIndex).map(row => Object.values(row)),
      totalRows: data.length,
      page,
      pageSize,
    };
  }

  async getModelComparison(datasetId: number): Promise<ModelComparison[]> {
    const models = await this.getModelsByDataset(datasetId);
    return models.map(model => ({
      id: model.id,
      modelType: model.modelType,
      accuracy: model.accuracy,
      precision: model.precision,
      recall: model.recall,
      f1Score: model.f1Score,
      rmse: model.rmse,
      mae: model.mae,
      r2Score: model.r2Score,
      status: model.status,
      trainingTime: model.trainingTime,
    }));
  }

  async getTrainingProgress(jobId: number): Promise<TrainingProgress> {
    const job = this.trainingJobs.get(jobId);
    if (!job) throw new Error(`Training job ${jobId} not found`);
    
    const models = await this.getModelComparison(job.datasetId);
    
    return {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
      totalSteps: job.totalSteps,
      models,
    };
  }

  // Helper method to store dataset data
  storeDatasetData(datasetId: number, data: any[]): void {
    this.datasetData.set(datasetId, data);
  }
}

export const storage = new MemStorage();
