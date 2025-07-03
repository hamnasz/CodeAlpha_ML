import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartLine, Download, Plus } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { DataPreview } from "@/components/data-preview";
import { ProgressStepper } from "@/components/progress-stepper";
import { ModelTraining } from "@/components/model-training";
import { FeatureEngineering } from "@/components/feature-engineering";
import { DataSummary } from "@/components/data-summary";
import { FeatureImportance } from "@/components/feature-importance";
import { ModelPerformance } from "@/components/model-performance";
import { ModelComparison } from "@/components/model-comparison";
import { ProductionRecommendations } from "@/components/production-recommendations";
import { useWebSocket } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [currentProject, setCurrentProject] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: projects, refetch: refetchProjects } = useQuery({
    queryKey: ['/api/projects'],
    refetchInterval: 5000,
  });

  const { data: project, refetch: refetchProject } = useQuery({
    queryKey: [`/api/projects/${currentProject}`],
    enabled: !!currentProject,
    refetchInterval: 2000,
  });

  const { data: dataset } = useQuery({
    queryKey: [`/api/projects/${currentProject}/dataset`],
    enabled: !!currentProject && project?.status !== 'uploading',
  });

  const { data: models } = useQuery({
    queryKey: [`/api/projects/${currentProject}/models`],
    enabled: !!currentProject && project?.status !== 'uploading',
  });

  const { data: bestModel } = useQuery({
    queryKey: [`/api/projects/${currentProject}/best-model`],
    enabled: !!currentProject && project?.status === 'completed',
  });

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (message.type === 'processing_complete' || message.type === 'training_complete') {
      refetchProject();
      refetchProjects();
      toast({
        title: "Success",
        description: message.type === 'processing_complete' ? "Data processing completed" : "Model training completed",
      });
    } else if (message.type === 'processing_error' || message.type === 'training_error') {
      toast({
        title: "Error",
        description: message.error,
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (projectId: number) => {
    setCurrentProject(projectId);
    refetchProjects();
    refetchProject();
  };

  const handleNewProject = () => {
    setCurrentProject(null);
  };

  const handleExportResults = async () => {
    if (!currentProject) return;
    
    try {
      const response = await fetch(`/api/projects/${currentProject}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.name}_results.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Results exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export results",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChartLine className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">CreditScore AI</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportResults}
              disabled={!currentProject || project?.status !== 'completed'}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
            <Button size="sm" onClick={handleNewProject}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Progress Stepper */}
        {currentProject && (
          <div className="mb-8">
            <ProgressStepper project={project} />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Data Upload & Processing */}
          <div className="lg:col-span-2 space-y-6">
            {!currentProject ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ChartLine className="h-5 w-5 mr-2 text-primary" />
                    Welcome to CreditScore AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Upload your financial dataset to get started with automated credit scoring and model training.
                  </p>
                  <FileUpload onUpload={handleFileUpload} />
                </CardContent>
              </Card>
            ) : (
              <>
                <FileUpload onUpload={handleFileUpload} />
                
                {dataset && (
                  <DataPreview dataset={dataset} />
                )}
                
                {project?.status === 'processing' && (
                  <FeatureEngineering />
                )}
                
                {(project?.status === 'training' || project?.status === 'completed') && models && (
                  <ModelTraining models={models} />
                )}
                
                {project?.status === 'completed' && models && (
                  <ModelComparison models={models} />
                )}
              </>
            )}
          </div>

          {/* Right Column - Stats & Insights */}
          <div className="space-y-6">
            {currentProject && dataset && (
              <DataSummary dataset={dataset} />
            )}
            
            {currentProject && bestModel && (
              <>
                <FeatureImportance model={bestModel} />
                <ModelPerformance model={bestModel} />
              </>
            )}
            
            {currentProject && project?.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" size="sm">
                    View Full Results
                  </Button>
                  <Button variant="outline" className="w-full" size="sm" onClick={handleExportResults}>
                    Export Model
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    Share Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Production Recommendations */}
        {currentProject && project?.status === 'completed' && (
          <div className="mt-8">
            <ProductionRecommendations />
          </div>
        )}
      </div>
    </div>
  );
}
