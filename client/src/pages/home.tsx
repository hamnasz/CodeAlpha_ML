import { useState } from "react";
import { Sun, Moon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { FileUpload } from "@/components/file-upload";
import { ProgressStepper } from "@/components/progress-stepper";
import { TaskDetection } from "@/components/task-detection";
import { DataPreview } from "@/components/data-preview";
import { TrainingDashboard } from "@/components/training-dashboard";
import { ModelComparison } from "@/components/model-comparison";
import { Visualizations } from "@/components/visualizations";
import { ModelMetrics } from "@/components/model-metrics";
import { ActionsPanel } from "@/components/actions-panel";
import { api, type UploadResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Step {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedDataset, setUploadedDataset] = useState<UploadResponse | null>(null);
  const [trainingJobId, setTrainingJobId] = useState<number | null>(null);
  const [bestModelId, setBestModelId] = useState<number | null>(null);

  const [steps, setSteps] = useState<Step[]>([
    { id: 'upload', title: 'Upload', status: 'current' },
    { id: 'preprocess', title: 'Preprocess', status: 'pending' },
    { id: 'train', title: 'Train', status: 'pending' },
    { id: 'results', title: 'Results', status: 'pending' },
  ]);

  const updateStepStatus = (stepIndex: number, status: Step['status']) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status } : step
    ));
  };

  const handleUploadComplete = async (data: UploadResponse) => {
    setUploadedDataset(data);
    updateStepStatus(0, 'completed');
    updateStepStatus(1, 'current');
    setCurrentStep(1);

    toast({
      title: "Dataset uploaded successfully",
      description: `${data.dataset.rows} rows, ${data.dataset.columns} columns`,
    });

    // Start training automatically
    setTimeout(async () => {
      try {
        updateStepStatus(1, 'completed');
        updateStepStatus(2, 'current');
        setCurrentStep(2);

        const trainingResult = await api.startTraining(data.dataset.id);
        setTrainingJobId(trainingResult.jobId);
        
        toast({
          title: "Training started",
          description: "Your models are now being trained",
        });
      } catch (error) {
        toast({
          title: "Training failed to start",
          description: "Please try again",
          variant: "destructive",
        });
        updateStepStatus(2, 'failed');
      }
    }, 2000);
  };

  const handleTrainingComplete = () => {
    updateStepStatus(2, 'completed');
    updateStepStatus(3, 'current');
    setCurrentStep(3);
    
    toast({
      title: "Training completed",
      description: "Your models are ready for evaluation",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold">AutoML Studio</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stepper */}
        <ProgressStepper steps={steps} currentStep={currentStep} />

        {/* Step 1: Upload */}
        {currentStep === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
            <div className="space-y-6">
              <div className="text-center p-8 text-muted-foreground">
                <p>Upload your dataset to get started</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preprocess & Step 3: Train */}
        {uploadedDataset && (currentStep === 1 || currentStep === 2) && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DataPreview 
                  datasetId={uploadedDataset.dataset.id}
                  taskType={uploadedDataset.dataset.taskType as 'classification' | 'regression'}
                />
              </div>
              <div className="space-y-6">
                <TaskDetection
                  taskType={uploadedDataset.dataset.taskType as 'classification' | 'regression'}
                  targetColumn={uploadedDataset.dataset.targetColumn}
                  datasetInfo={{
                    rows: uploadedDataset.dataset.rows,
                    columns: uploadedDataset.dataset.columns,
                    missingValues: uploadedDataset.dataset.missingValues,
                    size: uploadedDataset.dataset.size,
                  }}
                />
              </div>
            </div>

            {currentStep === 2 && trainingJobId && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TrainingDashboard 
                  jobId={trainingJobId}
                  onTrainingComplete={handleTrainingComplete}
                />
                <ModelComparison
                  datasetId={uploadedDataset.dataset.id}
                  taskType={uploadedDataset.dataset.taskType as 'classification' | 'regression'}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Results */}
        {uploadedDataset && currentStep === 3 && (
          <div className="space-y-8">
            <Visualizations
              modelId={bestModelId}
              taskType={uploadedDataset.dataset.taskType as 'classification' | 'regression'}
            />
            
            <ModelMetrics
              datasetId={uploadedDataset.dataset.id}
              taskType={uploadedDataset.dataset.taskType as 'classification' | 'regression'}
            />

            <ActionsPanel
              datasetId={uploadedDataset.dataset.id}
              bestModelId={bestModelId}
            />
          </div>
        )}
      </main>
    </div>
  );
}
