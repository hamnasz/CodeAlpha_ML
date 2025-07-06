import { CheckCircle, Target, BarChart3, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaskDetectionProps {
  taskType: 'classification' | 'regression';
  targetColumn: string;
  confidence?: number;
  datasetInfo: {
    rows: number;
    columns: number;
    missingValues: number;
    size: number;
  };
}

export function TaskDetection({ 
  taskType, 
  targetColumn, 
  confidence = 0.95, 
  datasetInfo 
}: TaskDetectionProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Task Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium capitalize">{taskType}</p>
              <p className="text-sm text-muted-foreground">
                Detected task type ({Math.round(confidence * 100)}% confidence)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="font-medium">Target: {targetColumn}</p>
              <p className="text-sm text-muted-foreground">Auto-detected column</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Dataset Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rows</span>
                <span className="text-sm font-medium">{datasetInfo.rows.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Columns</span>
                <span className="text-sm font-medium">{datasetInfo.columns}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Missing Values</span>
                <span className="text-sm font-medium">
                  {datasetInfo.missingValues === 0 ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      None
                    </Badge>
                  ) : (
                    datasetInfo.missingValues
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">File Size</span>
                <span className="text-sm font-medium">{formatFileSize(datasetInfo.size)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
