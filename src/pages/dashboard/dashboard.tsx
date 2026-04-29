import { Suspense } from "react";
import { DashboardShell } from "./new/dashboard-shell";

export default function Dashboard() {
  return (
    <section>
      <Suspense
        fallback={
          <div className="text-center py-10">
            Loading charts...
          </div>
        }
      >
        <DashboardShell />
      </Suspense>
    </section>
  );
}
