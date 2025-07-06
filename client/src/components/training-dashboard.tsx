import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type TrainingProgress } from "@/lib/api";

interface TrainingDashboardProps {
  jobId: number | null;
  onTrainingComplete?: () => void;
}

export function TrainingDashboard({ jobId, onTrainingComplete }: TrainingDashboardProps) {
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['/api/training', jobId, 'progress'],
    queryFn: () => api.getTrainingProgress(jobId!),
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop polling if training is complete or failed
      if (data && (data.status === 'completed' || data.status === 'failed')) {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  useEffect(() => {
    if (progress?.status === 'completed' && onTrainingComplete) {
      onTrainingComplete();
    }
  }, [progress?.status, onTrainingComplete]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !progress) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            Failed to load training progress
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'training':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Complete</Badge>;
      case 'training':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Training...</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">
              {progress.status === 'completed' ? 'Complete' : `${Math.round(progress.progress * 100)}%`}
            </span>
          </div>
          <Progress value={progress.progress * 100} className="h-2" />
          <div className="text-sm text-muted-foreground">
            Current step: {progress.currentStep}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Model Training Status</h4>
          {progress.models.map((model, index) => (
            <div key={model.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(model.status)}
                <div>
                  <p className="font-medium text-sm capitalize">
                    {model.modelType.replace('_', ' ')}
                  </p>
                  {model.trainingTime && (
                    <p className="text-xs text-muted-foreground">
                      {model.trainingTime.toFixed(1)}s
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {model.accuracy && (
                  <span className="text-sm font-medium">
                    {(model.accuracy * 100).toFixed(1)}%
                  </span>
                )}
                {model.r2Score && (
                  <span className="text-sm font-medium">
                    R²: {model.r2Score.toFixed(3)}
                  </span>
                )}
                {getStatusBadge(model.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
