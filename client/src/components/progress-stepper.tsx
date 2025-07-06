import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";

interface Step {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  const getStepIcon = (step: Step, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'current':
        return <Clock className="h-6 w-6 text-primary animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStepNumber = (index: number) => {
    return index + 1;
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">AutoML Pipeline</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-2">
            {/* Step */}
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                    step.status === 'current' ? 'bg-primary text-white' :
                    step.status === 'failed' ? 'bg-red-500 text-white' :
                    'bg-muted text-muted-foreground'}
                `}>
                  {step.status === 'completed' ? '✓' : 
                   step.status === 'failed' ? '✗' : 
                   getStepNumber(index)}
                </div>
                <span className={`
                  text-sm font-medium
                  ${step.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    step.status === 'current' ? 'text-primary' :
                    step.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                    'text-muted-foreground'}
                `}>
                  {step.title}
                </span>
              </div>
            </div>
            
            {/* Connector */}
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 
                ${index < currentStep ? 'bg-green-500' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
