import { pgTable, text, serial, integer, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  rows: integer("rows").notNull(),
  columns: integer("columns").notNull(),
  size: integer("size").notNull(),
  taskType: text("task_type").notNull(), // 'classification' | 'regression'
  targetColumn: text("target_column").notNull(),
  missingValues: integer("missing_values").notNull().default(0),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  preprocessed: boolean("preprocessed").notNull().default(false),
  preprocessingSummary: jsonb("preprocessing_summary"),
});

export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").notNull().references(() => datasets.id),
  modelType: text("model_type").notNull(), // 'random_forest', 'xgboost', 'logistic_regression', etc.
  status: text("status").notNull().default('pending'), // 'pending', 'training', 'completed', 'failed'
  progress: real("progress").notNull().default(0),
  accuracy: real("accuracy"),
  precision: real("precision"),
  recall: real("recall"),
  f1Score: real("f1_score"),
  rmse: real("rmse"),
  mae: real("mae"),
  r2Score: real("r2_score"),
  trainingTime: real("training_time"),
  hyperparameters: jsonb("hyperparameters"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const visualizations = pgTable("visualizations", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").notNull().references(() => models.id),
  type: text("type").notNull(), // 'confusion_matrix', 'roc_curve', 'feature_importance', 'residual_plot'
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trainingJobs = pgTable("training_jobs", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").notNull().references(() => datasets.id),
  status: text("status").notNull().default('pending'), // 'pending', 'running', 'completed', 'failed'
  progress: real("progress").notNull().default(0),
  currentStep: text("current_step").notNull().default('initializing'),
  totalSteps: integer("total_steps").notNull().default(4),
  bestModelId: integer("best_model_id").references(() => models.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  uploadedAt: true,
});

export const insertModelSchema = createInsertSchema(models).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertVisualizationSchema = createInsertSchema(visualizations).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingJobSchema = createInsertSchema(trainingJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Model = typeof models.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;
export type Visualization = typeof visualizations.$inferSelect;
export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;
export type TrainingJob = typeof trainingJobs.$inferSelect;
export type InsertTrainingJob = z.infer<typeof insertTrainingJobSchema>;

// Response types for API
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

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface TrainingProgress {
  jobId: number;
  status: string;
  progress: number;
  currentStep: string;
  totalSteps: number;
  models: ModelComparison[];
}
