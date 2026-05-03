import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StoreStats({
  total,
  page,
  pageCount,
  selectedCount,
}: {
  total: number;
  page: number;
  pageCount: number;
  selectedCount: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Total stores
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">{total}</CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Current page
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {page} / {pageCount}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Selected</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {selectedCount}
        </CardContent>
      </Card>
    </div>
  );
}
