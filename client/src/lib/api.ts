import { apiRequest } from "./queryClient";

export interface UploadResponse {
  dataset: {
    id: number;
    filename: string;
    originalName: string;
    rows: number;
    columns: number;
    size: number;
    taskType: string;
    targetColumn: string;
    missingValues: number;
    uploadedAt: string;
    preprocessed: boolean;
    preprocessingSummary: any;
  };
  preview: {
    headers: string[];
    rows: (string | number)[][];
    totalRows: number;
  };
}

export interface DatasetPreview {
  headers: string[];
  rows: (string | number)[][];
  totalRows: number;
  page: number;
  pageSize: number;
}

export interface ModelComparison {
  id: number;
  modelType: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rmse?: number;
  mae?: number;
  r2Score?: number;
  status: string;
  trainingTime?: number;
}

export interface TrainingProgress {
  jobId: number;
  status: string;
  progress: number;
  currentStep: string;
  totalSteps: number;
  models: ModelComparison[];
}

export interface Visualization {
  id: number;
  modelId: number;
  type: string;
  data: any;
  createdAt: string;
}

export const api = {
  uploadDataset: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  getDatasetPreview: async (id: number, page: number = 1, pageSize: number = 10): Promise<DatasetPreview> => {
    const response = await apiRequest('GET', `/api/datasets/${id}/preview?page=${page}&pageSize=${pageSize}`);
    return response.json();
  },

  getDataset: async (id: number) => {
    const response = await apiRequest('GET', `/api/datasets/${id}`);
    return response.json();
  },

  startTraining: async (datasetId: number) => {
    const response = await apiRequest('POST', `/api/datasets/${datasetId}/train`);
    return response.json();
  },

  getTrainingProgress: async (jobId: number): Promise<TrainingProgress> => {
    const response = await apiRequest('GET', `/api/training/${jobId}/progress`);
    return response.json();
  },

  getModelComparison: async (datasetId: number): Promise<ModelComparison[]> => {
    const response = await apiRequest('GET', `/api/datasets/${datasetId}/models`);
    return response.json();
  },

  getVisualizations: async (modelId: number): Promise<Visualization[]> => {
    const response = await apiRequest('GET', `/api/models/${modelId}/visualizations`);
    return response.json();
  },

  downloadReport: async (datasetId: number): Promise<void> => {
    const response = await apiRequest('GET', `/api/datasets/${datasetId}/report`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automl-report-${datasetId}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
