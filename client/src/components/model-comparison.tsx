import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, Crown } from "lucide-react";
import { RocCurveChart } from "./roc-curve-chart";
import type { Model } from "@shared/schema";

interface ModelComparisonProps {
  models: Model[];
}

export function ModelComparison({ models }: ModelComparisonProps) {
  const completedModels = models.filter(m => m.status === "completed");
  const bestModel = models.find(m => m.isBest);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scale className="h-5 w-5 mr-2 text-primary" />
          Model Comparison & ROC Curves
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model Comparison Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Precision</TableHead>
                  <TableHead>Recall</TableHead>
                  <TableHead>F1-Score</TableHead>
                  <TableHead>ROC-AUC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedModels.map((model) => (
                  <TableRow 
                    key={model.id} 
                    className={model.isBest ? "bg-green-500/10" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {model.isBest && <Crown className="h-4 w-4 text-yellow-500" />}
                        <span>{model.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className={model.isBest ? "text-green-500 font-semibold" : ""}>
                      {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {model.precision ? model.precision.toFixed(2) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {model.recall ? model.recall.toFixed(2) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {model.f1Score ? model.f1Score.toFixed(2) : "N/A"}
                    </TableCell>
                    <TableCell className={model.isBest ? "text-green-500 font-semibold" : ""}>
                      {model.rocAuc ? model.rocAuc.toFixed(2) : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
                {completedModels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No completed models available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ROC Curve Chart */}
          <div className="h-[300px]">
            <RocCurveChart models={completedModels} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
