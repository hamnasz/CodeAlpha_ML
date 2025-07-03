import { projects, datasets, models, trainingLogs, type Project, type Dataset, type Model, type TrainingLog, type InsertProject, type InsertDataset, type InsertModel, type InsertTrainingLog } from "@shared/schema";

export interface IStorage {
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Datasets
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  getDatasetByProjectId(projectId: number): Promise<Dataset | undefined>;
  updateDataset(id: number, updates: Partial<Dataset>): Promise<Dataset | undefined>;

  // Models
  createModel(model: InsertModel): Promise<Model>;
  getModelsByProjectId(projectId: number): Promise<Model[]>;
  updateModel(id: number, updates: Partial<Model>): Promise<Model | undefined>;
  getBestModel(projectId: number): Promise<Model | undefined>;
  setBestModel(projectId: number, modelId: number): Promise<void>;

  // Training Logs
  createTrainingLog(log: InsertTrainingLog): Promise<TrainingLog>;
  getTrainingLogsByProjectId(projectId: number): Promise<TrainingLog[]>;
  getTrainingLogsByModelId(modelId: number): Promise<TrainingLog[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project> = new Map();
  private datasets: Map<number, Dataset> = new Map();
  private models: Map<number, Model> = new Map();
  private trainingLogs: Map<number, TrainingLog> = new Map();
  private currentProjectId = 1;
  private currentDatasetId = 1;
  private currentModelId = 1;
  private currentLogId = 1;

  // Projects
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Datasets
  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const id = this.currentDatasetId++;
    const dataset: Dataset = {
      ...insertDataset,
      id,
    };
    this.datasets.set(id, dataset);
    return dataset;
  }

  async getDatasetByProjectId(projectId: number): Promise<Dataset | undefined> {
    return Array.from(this.datasets.values()).find(d => d.projectId === projectId);
  }

  async updateDataset(id: number, updates: Partial<Dataset>): Promise<Dataset | undefined> {
    const dataset = this.datasets.get(id);
    if (!dataset) return undefined;
    
    const updated: Dataset = { ...dataset, ...updates };
    this.datasets.set(id, updated);
    return updated;
  }

  // Models
  async createModel(insertModel: InsertModel): Promise<Model> {
    const id = this.currentModelId++;
    const model: Model = {
      ...insertModel,
      id,
    };
    this.models.set(id, model);
    return model;
  }

  async getModelsByProjectId(projectId: number): Promise<Model[]> {
    return Array.from(this.models.values()).filter(m => m.projectId === projectId);
  }

  async updateModel(id: number, updates: Partial<Model>): Promise<Model | undefined> {
    const model = this.models.get(id);
    if (!model) return undefined;
    
    const updated: Model = { ...model, ...updates };
    this.models.set(id, updated);
    return updated;
  }

  async getBestModel(projectId: number): Promise<Model | undefined> {
    return Array.from(this.models.values()).find(m => m.projectId === projectId && m.isBest);
  }

  async setBestModel(projectId: number, modelId: number): Promise<void> {
    // Reset all models for this project
    Array.from(this.models.values())
      .filter(m => m.projectId === projectId)
      .forEach(m => {
        this.models.set(m.id, { ...m, isBest: false });
      });
    
    // Set the new best model
    const model = this.models.get(modelId);
    if (model) {
      this.models.set(modelId, { ...model, isBest: true });
    }
  }

  // Training Logs
  async createTrainingLog(insertLog: InsertTrainingLog): Promise<TrainingLog> {
    const id = this.currentLogId++;
    const log: TrainingLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
    };
    this.trainingLogs.set(id, log);
    return log;
  }

  async getTrainingLogsByProjectId(projectId: number): Promise<TrainingLog[]> {
    return Array.from(this.trainingLogs.values())
      .filter(log => log.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }

  async getTrainingLogsByModelId(modelId: number): Promise<TrainingLog[]> {
    return Array.from(this.trainingLogs.values())
      .filter(log => log.modelId === modelId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }
}

export const storage = new MemStorage();
