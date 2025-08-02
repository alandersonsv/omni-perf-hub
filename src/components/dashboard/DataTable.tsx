import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableRow as TableRowType } from "@/types/dashboardTypes";
import { Database } from "lucide-react";

interface DataTableProps {
  title: string;
  data: TableRowType[];
  columns: {
    key: string;
    label: string;
    format?: (value: any) => string;
  }[];
}

export function DataTable({ title, data, columns }: DataTableProps) {
  const formatValue = (value: any, format?: (value: any) => string) => {
    if (format) return format(value);
    if (typeof value === 'number' && value > 100) {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {formatValue(row[column.key], column.format)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}