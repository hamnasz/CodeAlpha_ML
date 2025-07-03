import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import type { Model } from "@shared/schema";

interface FeatureImportanceProps {
  model: Model;
}

export function FeatureImportance({ model }: FeatureImportanceProps) {
  const featureImportance = model.featureImportance as any;
  
  if (!featureImportance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Feature Importance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No feature importance data available</p>
        </CardContent>
      </Card>
    );
  }

  const features = featureImportance.features || [];
  const importance = featureImportance.importance || [];
  
  const featureData = features.map((feature: string, index: number) => ({
    name: feature,
    importance: importance[index] || 0
  })).sort((a, b) => b.importance - a.importance).slice(0, 5);

  const maxImportance = Math.max(...featureData.map(f => f.importance));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Feature Importance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {featureData.map((feature, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium">{feature.name}</span>
            <div className="flex items-center space-x-2">
              <Progress 
                value={(feature.importance / maxImportance) * 100} 
                className="w-20 h-2"
              />
              <span className="text-xs text-muted-foreground w-8">
                {feature.importance.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
