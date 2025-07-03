import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { Model } from "@shared/schema";

interface ModelPerformanceProps {
  model: Model;
}

export function ModelPerformance({ model }: ModelPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Best Model Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-green-500">{model.name}</h3>
          <p className="text-muted-foreground text-sm">Current leader</p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-semibold text-green-500">
              {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Precision</span>
            <span className="font-semibold">
              {model.precision ? model.precision.toFixed(2) : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recall</span>
            <span className="font-semibold">
              {model.recall ? model.recall.toFixed(2) : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">F1-Score</span>
            <span className="font-semibold">
              {model.f1Score ? model.f1Score.toFixed(2) : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ROC-AUC</span>
            <span className="font-semibold text-green-500">
              {model.rocAuc ? model.rocAuc.toFixed(2) : "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
