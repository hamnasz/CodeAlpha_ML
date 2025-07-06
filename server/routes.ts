import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mlService } from "./services/ml-service";
import { insertDatasetSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const filePath = file.path;
      
      // Parse CSV/Excel file (simplified - in real implementation would use csv-parser or xlsx)
      const sampleData = generateSampleDataFromFile(file.originalname);
      
      // Detect task type
      const taskType = await mlService.detectTaskType(sampleData);
      
      // Determine target column (last column for now)
      const targetColumn = Object.keys(sampleData[0] || {}).pop() || 'target';
      
      // Create dataset record
      const dataset = await storage.createDataset({
        filename: file.filename,
        originalName: file.originalname,
        rows: sampleData.length,
        columns: Object.keys(sampleData[0] || {}).length,
        size: file.size,
        taskType,
        targetColumn,
        missingValues: 0,
        preprocessed: false,
        preprocessingSummary: null,
      });

      // Store the actual data
      (storage as any).storeDatasetData(dataset.id, sampleData);

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        dataset,
        preview: {
          headers: Object.keys(sampleData[0] || {}),
          rows: sampleData.slice(0, 5).map(row => Object.values(row)),
          totalRows: sampleData.length,
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Upload failed: " + (error as Error).message });
    }
  });

  // Get dataset preview
  app.get("/api/datasets/:id/preview", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const preview = await storage.getDatasetPreview(id, page, pageSize);
      res.json(preview);
    } catch (error) {
      res.status(500).json({ error: "Failed to get preview: " + (error as Error).message });
    }
  });

  // Get dataset info
  app.get("/api/datasets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dataset = await storage.getDataset(id);
      
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      res.json(dataset);
    } catch (error) {
      res.status(500).json({ error: "Failed to get dataset: " + (error as Error).message });
    }
  });

  // Start training
  app.post("/api/datasets/:id/train", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dataset = await storage.getDataset(id);
      
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      const jobId = await mlService.trainAllModels(id);
      res.json({ jobId, status: "Training started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start training: " + (error as Error).message });
    }
  });

  // Get training progress
  app.get("/api/training/:jobId/progress", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const progress = await storage.getTrainingProgress(jobId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to get progress: " + (error as Error).message });
    }
  });

  // Get model comparison
  app.get("/api/datasets/:id/models", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const models = await storage.getModelComparison(id);
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to get models: " + (error as Error).message });
    }
  });

  // Get visualizations
  app.get("/api/models/:id/visualizations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const visualizations = await storage.getVisualizationsByModel(id);
      res.json(visualizations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get visualizations: " + (error as Error).message });
    }
  });

  // Download report
  app.get("/api/datasets/:id/report", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dataset = await storage.getDataset(id);
      
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      const models = await storage.getModelComparison(id);
      
      // Generate report (simplified)
      const report = {
        dataset: {
          name: dataset.originalName,
          rows: dataset.rows,
          columns: dataset.columns,
          taskType: dataset.taskType,
          targetColumn: dataset.targetColumn,
        },
        models: models,
        generatedAt: new Date().toISOString(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="automl-report-${id}.json"`);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate report: " + (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate sample data from file info
function generateSampleDataFromFile(filename: string): any[] {
  const sampleData = [];
  const features = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'];
  const species = ['setosa', 'versicolor', 'virginica'];

  for (let i = 0; i < 150; i++) {
    const row: any = {};
    
    features.forEach(feature => {
      row[feature] = parseFloat((Math.random() * 3 + 4).toFixed(1));
    });
    
    row['species'] = species[Math.floor(Math.random() * species.length)];
    sampleData.push(row);
  }

  return sampleData;
}
