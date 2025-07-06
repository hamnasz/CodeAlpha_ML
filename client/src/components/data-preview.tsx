import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DataPreviewProps {
  datasetId: number;
  taskType: 'classification' | 'regression';
}

export function DataPreview({ datasetId, taskType }: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: preview, isLoading, error } = useQuery({
    queryKey: ['/api/datasets', datasetId, 'preview', currentPage, pageSize],
    queryFn: () => api.getDatasetPreview(datasetId, currentPage, pageSize),
    enabled: !!datasetId,
  });

  const totalPages = preview ? Math.ceil(preview.totalRows / pageSize) : 0;

  const renderCellValue = (value: string | number, header: string, isTarget: boolean) => {
    if (isTarget && taskType === 'classification') {
      const colors = [
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      ];
      const colorIndex = Math.abs(String(value).charCodeAt(0)) % colors.length;
      
      return (
        <Badge variant="secondary" className={colors[colorIndex]}>
          {value}
        </Badge>
      );
    }
    
    return <span className="text-sm">{value}</span>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            Failed to load dataset preview
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dataset Preview</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {preview.headers.map((header, index) => (
                  <TableHead key={index} className="font-medium">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/50">
                  {row.map((cell, cellIndex) => {
                    const header = preview.headers[cellIndex];
                    const isTarget = cellIndex === preview.headers.length - 1; // Assume last column is target
                    
                    return (
                      <TableCell key={cellIndex} className="py-3">
                        {renderCellValue(cell, header, isTarget)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, preview.totalRows)} of {preview.totalRows.toLocaleString()} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
