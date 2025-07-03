import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableIcon } from "lucide-react";
import type { Dataset } from "@shared/schema";

interface DataPreviewProps {
  dataset: Dataset;
}

export function DataPreview({ dataset }: DataPreviewProps) {
  const summary = dataset.summary as any;
  const previewData = [
    { id: "C001", age: 29, income: "$52,000", creditScore: 720, loanAmount: "$15,000", default: "No" },
    { id: "C002", age: 35, income: "$78,000", creditScore: 680, loanAmount: "$25,000", default: "Yes" },
    { id: "C003", age: 42, income: "$65,000", creditScore: 750, loanAmount: "$18,000", default: "No" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TableIcon className="h-5 w-5 mr-2 text-primary" />
          Data Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Credit Score</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Default</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.income}</TableCell>
                  <TableCell>{row.creditScore}</TableCell>
                  <TableCell>{row.loanAmount}</TableCell>
                  <TableCell>
                    <Badge variant={row.default === "No" ? "secondary" : "destructive"}>
                      {row.default}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Showing 3 of {dataset.totalRecords?.toLocaleString()} records</span>
          <Button variant="link" size="sm">
            View Full Dataset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
