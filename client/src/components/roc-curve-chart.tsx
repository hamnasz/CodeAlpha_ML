import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import type { Model } from "@shared/schema";

Chart.register(...registerables);

interface RocCurveChartProps {
  models: Model[];
}

export function RocCurveChart({ models }: RocCurveChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Generate ROC curve data for models
    const datasets = models.map((model, index) => {
      const colors = ['#1976D2', '#00C853', '#FF5722', '#9C27B0'];
      
      // Generate mock ROC curve data (in real implementation, this would come from backend)
      const rocAuc = model.rocAuc || 0.5;
      const points = [];
      
      for (let i = 0; i <= 100; i++) {
        const fpr = i / 100;
        // Simulate a realistic ROC curve based on AUC
        const tpr = Math.min(1, Math.max(0, 
          rocAuc === 0.5 ? fpr : 
          Math.pow(fpr, 1 / (2 * rocAuc)) * rocAuc * 2
        ));
        points.push({ x: fpr, y: tpr });
      }

      return {
        label: `${model.name} (AUC = ${rocAuc.toFixed(2)})`,
        data: points,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '10',
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        tension: 0.1
      };
    });

    // Add diagonal reference line
    datasets.push({
      label: 'Random Baseline',
      data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      borderColor: '#666',
      borderWidth: 1,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0,
      tension: 0
    });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'ROC Curves',
            color: '#ffffff'
          },
          legend: {
            labels: {
              color: '#b0bec5'
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'False Positive Rate',
              color: '#b0bec5'
            },
            ticks: {
              color: '#b0bec5'
            },
            grid: {
              color: '#424242'
            }
          },
          y: {
            title: {
              display: true,
              text: 'True Positive Rate',
              color: '#b0bec5'
            },
            ticks: {
              color: '#b0bec5'
            },
            grid: {
              color: '#424242'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [models]);

  return <canvas ref={chartRef} />;
}
