import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";

export function ProductionRecommendations() {
  const recommendations = [
    {
      title: "Bias Mitigation",
      description: "Monitor for potential demographic bias in model predictions",
      icon: AlertTriangle,
      color: "text-yellow-500",
      items: [
        "Implement fairness metrics",
        "Regular bias audits",
        "Diverse training data"
      ]
    },
    {
      title: "Model Monitoring",
      description: "Set up continuous monitoring for model performance degradation",
      icon: TrendingUp,
      color: "text-blue-500",
      items: [
        "Data drift detection",
        "Performance alerts",
        "Real-time metrics"
      ]
    },
    {
      title: "Retraining Pipeline",
      description: "Automated retraining schedule based on performance metrics",
      icon: RefreshCw,
      color: "text-green-500",
      items: [
        "Monthly retraining",
        "A/B testing framework",
        "Version control"
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Production Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-muted rounded-lg p-4">
              <h3 className={`font-semibold mb-2 flex items-center ${rec.color}`}>
                <rec.icon className="h-4 w-4 mr-2" />
                {rec.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {rec.items.map((item, itemIndex) => (
                  <li key={itemIndex}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
