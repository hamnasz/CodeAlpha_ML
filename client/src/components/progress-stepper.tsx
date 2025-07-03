import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";
import type { Project } from "@shared/schema";

interface ProgressStepperProps {
  project: Project | undefined;
}

export function ProgressStepper({ project }: ProgressStepperProps) {
  const steps = [
    { name: "Data Upload", key: "uploading" },
    { name: "Processing", key: "processing" },
    { name: "Model Training", key: "training" },
    { name: "Results", key: "completed" },
  ];

  const getStepStatus = (stepKey: string) => {
    if (!project) return "pending";
    
    const currentIndex = steps.findIndex(s => s.key === project.status);
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    
    if (project.status === "error") {
      return stepIndex <= currentIndex ? "error" : "pending";
    }
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const getStepIcon = (stepKey: string) => {
    const status = getStepStatus(stepKey);
    
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "current":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepColor = (stepKey: string) => {
    const status = getStepStatus(stepKey);
    
    switch (status) {
      case "completed":
        return "text-green-500";
      case "current":
        return "text-blue-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className="flex items-center">
            {getStepIcon(step.key)}
            <span className={`ml-2 font-medium ${getStepColor(step.key)}`}>
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 mx-4 h-0.5 bg-border">
              <div 
                className={`h-full transition-all duration-300 ${
                  getStepStatus(step.key) === "completed" ? "bg-green-500" : "bg-border"
                }`}
                style={{ 
                  width: getStepStatus(step.key) === "completed" ? "100%" : "0%" 
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
