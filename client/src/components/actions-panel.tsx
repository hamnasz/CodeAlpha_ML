import { Download, FileDown, Cloud, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ActionsPanelProps {
  datasetId: number;
  bestModelId?: number;
}

export function ActionsPanel({ datasetId, bestModelId }: ActionsPanelProps) {
  const { toast } = useToast();

  const handleDownloadReport = async () => {
    try {
      await api.downloadReport(datasetId);
      toast({
        title: "Report downloaded",
        description: "Your AutoML report has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportModel = () => {
    toast({
      title: "Feature coming soon",
      description: "Model export functionality will be available soon",
    });
  };

  const handleDeployAPI = () => {
    toast({
      title: "Feature coming soon",
      description: "API deployment functionality will be available soon",
    });
  };

  const actions = [
    {
      title: "Download Report",
      description: "PDF with full analysis",
      icon: Download,
      onClick: handleDownloadReport,
      variant: "default" as const,
      className: "bg-primary hover:bg-primary/90 text-white",
    },
    {
      title: "Export Model",
      description: "Pickle/Joblib format",
      icon: FileDown,
      onClick: handleExportModel,
      variant: "secondary" as const,
      className: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    {
      title: "Deploy API",
      description: "REST endpoint ready",
      icon: Cloud,
      onClick: handleDeployAPI,
      variant: "secondary" as const,
      className: "bg-orange-600 hover:bg-orange-700 text-white",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export & Deploy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`flex items-center space-x-3 p-4 h-auto ${action.className}`}
              variant={action.variant}
            >
              <action.icon className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">{action.title}</p>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
