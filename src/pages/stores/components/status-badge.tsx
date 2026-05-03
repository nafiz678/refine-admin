import { CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="gap-1 rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" /> Active
    </Badge>
  ) : (
    <Badge className="gap-1 rounded-full bg-background border-border border text-muted-foreground">
      <XCircle className="h-3.5 w-3.5" /> Inactive
    </Badge>
  );
}
