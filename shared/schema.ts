import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("uploading"), // uploading, processing, training, completed, error
  filename: text("filename"),
  filesize: integer("filesize"),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  totalRecords: integer("total_records"),
  features: integer("features"),
  missingValues: integer("missing_values"),
  defaultRate: real("default_rate"),
  dataQuality: text("data_quality"),
  summary: jsonb("summary"),
});

export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // logistic_regression, decision_tree, random_forest
  status: text("status").notNull().default("pending"), // pending, training, completed, error
  accuracy: real("accuracy"),
  precision: real("precision"),
  recall: real("recall"),
  f1Score: real("f1_score"),
  rocAuc: real("roc_auc"),
  hyperparameters: jsonb("hyperparameters"),
  featureImportance: jsonb("feature_importance"),
  trainingTime: integer("training_time"),
  isBest: boolean("is_best").default(false),
});

export const trainingLogs = pgTable("training_logs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  modelId: integer("model_id").references(() => models.id),
  message: text("message").notNull(),
  level: text("level").notNull().default("info"), // info, warning, error
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
});

export const insertModelSchema = createInsertSchema(models).omit({
  id: true,
});

export const insertTrainingLogSchema = createInsertSchema(trainingLogs).omit({
  id: true,
  timestamp: true,
});

export type Project = typeof projects.$inferSelect;
export type Dataset = typeof datasets.$inferSelect;
export type Model = typeof models.$inferSelect;
export type TrainingLog = typeof trainingLogs.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type InsertModel = z.infer<typeof insertModelSchema>;
export type InsertTrainingLog = z.infer<typeof insertTrainingLogSchema>;
