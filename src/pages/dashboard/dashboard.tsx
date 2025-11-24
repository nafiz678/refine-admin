import React, { Suspense } from "react";
import DashboardSectionOne from "./dashboard-section-one";
import DashBoardSectionTwo from "./dashboard-section-two";
import { DashboardChat } from "./dashboard-charts";

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
        <DashboardSectionOne />
      </Suspense>
      <Suspense
        fallback={
          <div className="text-center py-10">
            Loading charts...
          </div>
        }
      >
        <DashBoardSectionTwo />
      </Suspense>
      <DashboardChat />
    </section>
  );
}
