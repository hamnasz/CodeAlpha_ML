export class VisualizationService {
  generateConfusionMatrix(data: any[], targetColumn: string): any {
    const uniqueClasses = [...new Set(data.map(row => row[targetColumn]))];
    const matrix = uniqueClasses.map(actual => 
      uniqueClasses.map(predicted => {
        // Simulate confusion matrix values
        if (actual === predicted) {
          return Math.floor(Math.random() * 20) + 40; // High diagonal values
        } else {
          return Math.floor(Math.random() * 5); // Low off-diagonal values
        }
      })
    );

    return {
      labels: uniqueClasses,
      matrix,
      accuracy: 0.85 + Math.random() * 0.14,
    };
  }

  generateROCCurve(data: any[], targetColumn: string): any {
    const uniqueClasses = [...new Set(data.map(row => row[targetColumn]))];
    const curves = uniqueClasses.map(className => {
      const points = [];
      for (let i = 0; i <= 100; i++) {
        const fpr = i / 100;
        const tpr = Math.min(1, fpr + Math.random() * (1 - fpr) * 0.8 + 0.2);
        points.push({ fpr, tpr });
      }
      return {
        label: className,
        points,
        auc: 0.8 + Math.random() * 0.19,
      };
    });

    return { curves };
  }

  generateFeatureImportance(data: any[], targetColumn: string): any {
    const features = Object.keys(data[0] || {}).filter(key => key !== targetColumn);
    const importances = features.map(feature => ({
      feature,
      importance: Math.random(),
    })).sort((a, b) => b.importance - a.importance);

    return { importances };
  }

  generateResidualPlot(data: any[], targetColumn: string): any {
    const points = data.map((_, index) => ({
      predicted: Math.random() * 10,
      residual: (Math.random() - 0.5) * 2,
      index,
    }));

    return {
      points,
      meanSquaredError: 0.1 + Math.random() * 0.5,
    };
  }
}

export const visualizationService = new VisualizationService();
