import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import type { Dataset } from "@shared/schema";

interface DataSummaryProps {
  dataset: Dataset;
}

export function DataSummary({ dataset }: DataSummaryProps) {
  const getQualityColor = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-blue-500";
      case "fair":
        return "text-yellow-500";
      case "poor":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
          Data Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Records</span>
          <span className="font-semibold text-lg">
            {dataset.totalRecords?.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Features</span>
          <span className="font-semibold text-lg">{dataset.features}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Missing Values</span>
          <span className="font-semibold text-lg text-warning">
            {dataset.missingValues?.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Default Rate</span>
          <span className="font-semibold text-lg text-warning">
            {dataset.defaultRate?.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Data Quality</span>
          <span className={`font-semibold text-lg ${getQualityColor(dataset.dataQuality || "")}`}>
            {dataset.dataQuality}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
