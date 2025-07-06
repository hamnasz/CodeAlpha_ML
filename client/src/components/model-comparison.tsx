import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type ModelComparison } from "@/lib/api";

interface ModelComparisonProps {
  datasetId: number;
  taskType: 'classification' | 'regression';
}

export function ModelComparison({ datasetId, taskType }: ModelComparisonProps) {
  const { data: models, isLoading, error } = useQuery({
    queryKey: ['/api/datasets', datasetId, 'models'],
    queryFn: () => api.getModelComparison(datasetId),
    enabled: !!datasetId,
  });

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

  if (error || !models) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            Failed to load model comparison
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedModels = models.filter(m => m.status === 'completed');
  const sortedModels = [...completedModels].sort((a, b) => {
    const scoreA = taskType === 'classification' ? (a.accuracy || 0) : (a.r2Score || 0);
    const scoreB = taskType === 'classification' ? (b.accuracy || 0) : (b.r2Score || 0);
    return scoreB - scoreA;
  });

  const getModelIcon = (modelType: string) => {
    switch (modelType.toLowerCase()) {
      case 'random_forest':
      case 'random_forest_regressor':
        return <TrendingUp className="h-4 w-4" />;
      case 'xgboost':
      case 'xgboost_regressor':
        return <Target className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatModelName = (modelType: string) => {
    return modelType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(' Regressor', '');
  };

  const getScoreDisplay = (model: ModelComparison) => {
    if (taskType === 'classification') {
      return {
        primary: model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : 'N/A',
        label: 'Accuracy',
      };
    } else {
      return {
        primary: model.r2Score ? model.r2Score.toFixed(3) : 'N/A',
        label: 'R² Score',
      };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedModels.map((model, index) => {
          const score = getScoreDisplay(model);
          const isBest = index === 0;
          
          return (
            <div
              key={model.id}
              className={`
                flex items-center justify-between p-4 rounded-lg border
                ${isBest ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-muted/50'}
              `}
            >
              <div className="flex items-center space-x-3">
                {isBest && <Trophy className="h-4 w-4 text-yellow-500" />}
                <div className="flex items-center space-x-2">
                  {getModelIcon(model.modelType)}
                  <div>
                    <p className="font-medium text-sm">
                      {formatModelName(model.modelType)}
                    </p>
                    {model.trainingTime && (
                      <p className="text-xs text-muted-foreground">
                        {model.trainingTime.toFixed(1)}s training time
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className={`font-semibold ${isBest ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {score.primary}
                  </p>
                  <p className="text-xs text-muted-foreground">{score.label}</p>
                </div>
                {isBest && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Best
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
        
        {models.filter(m => m.status === 'training').map((model) => (
          <div
            key={model.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg opacity-75"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="font-medium text-sm">
                  {formatModelName(model.modelType)}
                </span>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Training...
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
