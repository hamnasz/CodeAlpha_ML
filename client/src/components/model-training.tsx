import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, CheckCircle } from "lucide-react";
import type { Model } from "@shared/schema";

interface ModelTrainingProps {
  models: Model[];
}

export function ModelTraining({ models }: ModelTrainingProps) {
  const getModelProgress = (model: Model) => {
    switch (model.status) {
      case "completed":
        return 100;
      case "training":
        return 75;
      case "pending":
        return 0;
      default:
        return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "training":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "training":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Model Training Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {models.map((model) => (
          <div key={model.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {getStatusIcon(model.status)}
                <span className="font-medium">{model.name}</span>
                {model.isBest && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                    Best Model
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {model.status === "completed" && model.accuracy 
                  ? `${(model.accuracy * 100).toFixed(1)}%`
                  : model.status === "training"
                  ? "Training..."
                  : "Pending"
                }
              </span>
            </div>
            <Progress value={getModelProgress(model)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {model.status === "completed" 
                  ? "Training complete" 
                  : model.status === "training"
                  ? "Hyperparameter tuning..."
                  : "Waiting to start"
                }
              </span>
              {model.status === "completed" && model.accuracy && (
                <span>Accuracy: {(model.accuracy * 100).toFixed(1)}%</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
