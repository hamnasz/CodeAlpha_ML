import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServerCog, CheckCircle, Clock } from "lucide-react";

export function FeatureEngineering() {
  const features = [
    {
      name: "Debt-to-Income Ratio",
      description: "Calculated from monthly debt payments and income",
      status: "completed"
    },
    {
      name: "Credit Utilization Rate",
      description: "Credit used vs. available credit limits",
      status: "completed"
    },
    {
      name: "Average Payment Delays",
      description: "Historical payment delay patterns",
      status: "processing"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="text-green-500">Complete</Badge>;
      case "processing":
        return <Badge variant="outline" className="text-blue-500">Processing...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ServerCog className="h-5 w-5 mr-2 text-primary" />
          Feature Engineering
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(feature.status)}
              <div>
                <h3 className="font-medium">{feature.name}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
            {getStatusBadge(feature.status)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
