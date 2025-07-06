import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, BarChart3, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ModelMetricsProps {
  datasetId: number;
  taskType: 'classification' | 'regression';
}

export function ModelMetrics({ datasetId, taskType }: ModelMetricsProps) {
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
            Failed to load model metrics
          </div>
        </CardContent>
      </Card>
    );
  }

  const bestModel = models
    .filter(m => m.status === 'completed')
    .reduce((best, current) => {
      const bestScore = taskType === 'classification' ? (best.accuracy || 0) : (best.r2Score || 0);
      const currentScore = taskType === 'classification' ? (current.accuracy || 0) : (current.r2Score || 0);
      return currentScore > bestScore ? current : best;
    });

  if (!bestModel) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            No completed models available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMetricCards = () => {
    if (taskType === 'classification') {
      return [
        {
          title: 'Accuracy',
          value: bestModel.accuracy ? `${(bestModel.accuracy * 100).toFixed(1)}%` : 'N/A',
          icon: Award,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
          title: 'Precision',
          value: bestModel.precision ? `${(bestModel.precision * 100).toFixed(1)}%` : 'N/A',
          icon: Target,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
          title: 'Recall',
          value: bestModel.recall ? `${(bestModel.recall * 100).toFixed(1)}%` : 'N/A',
          icon: TrendingUp,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
          title: 'F1 Score',
          value: bestModel.f1Score ? `${(bestModel.f1Score * 100).toFixed(1)}%` : 'N/A',
          icon: BarChart3,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        },
      ];
    } else {
      return [
        {
          title: 'R² Score',
          value: bestModel.r2Score ? bestModel.r2Score.toFixed(3) : 'N/A',
          icon: Award,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
          title: 'RMSE',
          value: bestModel.rmse ? bestModel.rmse.toFixed(3) : 'N/A',
          icon: Target,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
          title: 'MAE',
          value: bestModel.mae ? bestModel.mae.toFixed(3) : 'N/A',
          icon: TrendingUp,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
          title: 'Training Time',
          value: bestModel.trainingTime ? `${bestModel.trainingTime.toFixed(1)}s` : 'N/A',
          icon: BarChart3,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        },
      ];
    }
  };

  const metricCards = getMetricCards();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Best model: {bestModel.modelType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((metric, index) => (
            <div key={index} className={`${metric.bgColor} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-full ${metric.bgColor} flex items-center justify-center`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
