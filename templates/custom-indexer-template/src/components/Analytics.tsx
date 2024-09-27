import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/analytics-board/data-table";
import { columns } from "@/components/analytics-board/columns";

export const Analytics = async () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable columns={columns} />
      </CardContent>
    </Card>
  );
};
