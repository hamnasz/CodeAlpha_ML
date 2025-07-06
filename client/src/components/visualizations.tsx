import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VisualizationsProps {
  modelId: number | null;
  taskType: 'classification' | 'regression';
}

export function Visualizations({ modelId, taskType }: VisualizationsProps) {
  const { data: visualizations, isLoading, error } = useQuery({
    queryKey: ['/api/models', modelId, 'visualizations'],
    queryFn: () => api.getVisualizations(modelId!),
    enabled: !!modelId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !visualizations) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-500">
              Failed to load visualizations
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confusionMatrix = visualizations.find(v => v.type === 'confusion_matrix');
  const featureImportance = visualizations.find(v => v.type === 'feature_importance');
  const rocCurve = visualizations.find(v => v.type === 'roc_curve');
  const residualPlot = visualizations.find(v => v.type === 'residual_plot');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Confusion Matrix or Residual Plot */}
      <Card>
        <CardHeader>
          <CardTitle>
            {taskType === 'classification' ? 'Confusion Matrix' : 'Residual Plot'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskType === 'classification' && confusionMatrix ? (
            <ConfusionMatrixChart data={confusionMatrix.data} />
          ) : residualPlot ? (
            <ResidualPlotChart data={residualPlot.data} />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Importance */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Importance</CardTitle>
        </CardHeader>
        <CardContent>
          {featureImportance ? (
            <FeatureImportanceChart data={featureImportance.data} />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConfusionMatrixChart({ data }: { data: any }) {
  const { labels, matrix, accuracy } = data;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
        {matrix.map((row: number[], rowIndex: number) =>
          row.map((value: number, colIndex: number) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                ${rowIndex === colIndex 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}
              `}
              style={{
                opacity: 0.3 + (value / Math.max(...matrix.flat())) * 0.7
              }}
            >
              {value}
            </div>
          ))
        )}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Accuracy: {(accuracy * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

function FeatureImportanceChart({ data }: { data: any }) {
  const { importances } = data;
  
  const colors = [
    '#6366f1', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'
  ];
  
  return (
    <div className="space-y-4">
      {importances.map((item: any, index: number) => (
        <div key={item.feature} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{item.feature}</span>
            <span className="text-sm font-medium">{item.importance.toFixed(2)}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${item.importance * 100}%`,
                backgroundColor: colors[index % colors.length]
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResidualPlotChart({ data }: { data: any }) {
  const { points, meanSquaredError } = data;
  
  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points.slice(0, 20)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="residual" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Mean Squared Error: {meanSquaredError.toFixed(3)}
        </p>
      </div>
    </div>
  );
}
