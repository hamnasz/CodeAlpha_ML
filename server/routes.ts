import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertProjectSchema, insertDatasetSchema, insertModelSchema, insertTrainingLogSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

const upload = multer({ dest: 'server/uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws'
  });

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('Client connected to credit scoring WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received:', data);
      } catch (e) {
        console.error('Invalid JSON:', e);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from credit scoring WebSocket');
    });
  });

  // Broadcast to all connected clients
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Projects
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: 'Invalid project data' });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  app.put('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update project' });
    }
  });

  // File upload
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { originalname, filename, size } = req.file;
      const projectName = req.body.projectName || `Project ${Date.now()}`;

      // Create project
      const project = await storage.createProject({
        name: projectName,
        filename: originalname,
        filesize: size,
        status: 'processing'
      });

      // Start processing
      processFile(project.id, filename, broadcast);

      res.json({ project, message: 'File uploaded successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Datasets
  app.get('/api/projects/:id/dataset', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const dataset = await storage.getDatasetByProjectId(projectId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }
      res.json(dataset);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dataset' });
    }
  });

  // Models
  app.get('/api/projects/:id/models', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const models = await storage.getModelsByProjectId(projectId);
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  });

  app.get('/api/projects/:id/best-model', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const model = await storage.getBestModel(projectId);
      if (!model) {
        return res.status(404).json({ error: 'No best model found' });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch best model' });
    }
  });

  // Training logs
  app.get('/api/projects/:id/logs', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const logs = await storage.getTrainingLogsByProjectId(projectId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  // Export results
  app.get('/api/projects/:id/export', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      const dataset = await storage.getDatasetByProjectId(projectId);
      const models = await storage.getModelsByProjectId(projectId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const exportData = {
        project,
        dataset,
        models,
        exportedAt: new Date().toISOString()
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${project.name}_results.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export results' });
    }
  });

  // Start model training
  app.post('/api/projects/:id/train', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Update project status
      await storage.updateProject(projectId, { status: 'training' });

      // Start training
      trainModels(projectId, broadcast);

      res.json({ message: 'Training started' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start training' });
    }
  });

  return httpServer;
}

async function processFile(projectId: number, filename: string, broadcast: (data: any) => void) {
  try {
    const filePath = path.join('server/uploads', filename);
    
    // Create initial models
    const modelTypes = [
      { name: 'Logistic Regression', type: 'logistic_regression' },
      { name: 'Decision Tree', type: 'decision_tree' },
      { name: 'Random Forest', type: 'random_forest' }
    ];

    for (const modelType of modelTypes) {
      await storage.createModel({
        projectId,
        name: modelType.name,
        type: modelType.type,
        status: 'pending'
      });
    }

    // Run Python script to analyze data
    const pythonProcess = spawn('python', [
      'server/ml/credit_scoring.py',
      'analyze',
      filePath,
      projectId.toString()
    ]);

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Python output:', output);
      
      try {
        const result = JSON.parse(output);
        if (result.type === 'dataset_summary') {
          storage.createDataset({
            projectId,
            totalRecords: result.data.totalRecords,
            features: result.data.features,
            missingValues: result.data.missingValues,
            defaultRate: result.data.defaultRate,
            dataQuality: result.data.dataQuality,
            summary: result.data.summary
          });
        }
        
        broadcast({
          type: 'processing_update',
          projectId,
          data: result
        });
      } catch (e) {
        console.log('Non-JSON output:', output);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        storage.updateProject(projectId, { status: 'processed' });
        broadcast({
          type: 'processing_complete',
          projectId
        });
      } else {
        storage.updateProject(projectId, { status: 'error' });
        broadcast({
          type: 'processing_error',
          projectId,
          error: 'Failed to process file'
        });
      }
    });

  } catch (error) {
    console.error('Error processing file:', error);
    await storage.updateProject(projectId, { status: 'error' });
    broadcast({
      type: 'processing_error',
      projectId,
      error: error.message
    });
  }
}

async function trainModels(projectId: number, broadcast: (data: any) => void) {
  try {
    const project = await storage.getProject(projectId);
    const filePath = path.join('server/uploads', project?.filename || '');

    // Run Python script to train models
    const pythonProcess = spawn('python', [
      'server/ml/credit_scoring.py',
      'train',
      filePath,
      projectId.toString()
    ]);

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Training output:', output);
      
      try {
        const result = JSON.parse(output);
        
        if (result.type === 'model_update') {
          const models = storage.getModelsByProjectId(projectId);
          models.then(modelList => {
            const model = modelList.find(m => m.type === result.data.modelType);
            if (model) {
              storage.updateModel(model.id, {
                status: result.data.status,
                accuracy: result.data.accuracy,
                precision: result.data.precision,
                recall: result.data.recall,
                f1Score: result.data.f1Score,
                rocAuc: result.data.rocAuc,
                featureImportance: result.data.featureImportance,
                hyperparameters: result.data.hyperparameters,
                trainingTime: result.data.trainingTime
              });
            }
          });
        }
        
        broadcast({
          type: 'training_update',
          projectId,
          data: result
        });
      } catch (e) {
        console.log('Non-JSON output:', output);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Training error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        storage.updateProject(projectId, { status: 'completed' });
        broadcast({
          type: 'training_complete',
          projectId
        });
      } else {
        storage.updateProject(projectId, { status: 'error' });
        broadcast({
          type: 'training_error',
          projectId,
          error: 'Failed to train models'
        });
      }
    });

  } catch (error) {
    console.error('Error training models:', error);
    await storage.updateProject(projectId, { status: 'error' });
    broadcast({
      type: 'training_error',
      projectId,
      error: error.message
    });
  }
}
