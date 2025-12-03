import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib";
import UsersTable from "./users-table";
import { PageHeader } from "@/components/refine-ui/layout/page-header";
import { UsersChart } from "./users-chart";

const UsersTablePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res =
        await supabaseAdmin.auth.admin.listUsers();
      return res.data.users;
    },
  });

  const users = data ?? [];

  if (isLoading) {
    return <Loader />;
  }

  if (users.length === 0) {
    return (
      <section className="container mx-auto space-y-5 p-4">
        <h1 className="font-semibold text-xl">Users</h1>
        <p>No users found</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto space-y-5 p-4">
      <PageHeader
        title="Users"
        subtitle="Manage all the users here"
      />
      <div>
        <UsersChart />

        <UsersTable
          data={users}
          totalUsers={users.length}
        />
      </div>
    </section>
  );
};

export default UsersTablePage;

function Loader() {
  return (
    <section className="">
      {/* Top bar skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-5 py-4">
        <Skeleton className="h-10 w-[250px] animate-shimmer" />

        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[120px] animate-shimmer" />
          <Skeleton className="h-10 w-[120px] animate-shimmer" />
        </div>
      </div>

      <div className="rounded-md border">
        {/* Table Header */}
        <div className="grid grid-cols-4 border-b px-4 py-3">
          <Skeleton className="h-5 w-20 animate-shimmer" />
          <Skeleton className="h-5 w-20 animate-shimmer" />
          <Skeleton className="h-5 w-16 animate-shimmer" />
          <Skeleton className="h-5 w-16 animate-shimmer" />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-4 items-center border-b px-4 py-4"
          >
            {/* Name + Avatar */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full animate-shimmer" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 animate-shimmer" />
                <Skeleton className="h-3 w-24 animate-shimmer" />
              </div>
            </div>

            {/* Email */}
            <Skeleton className="h-4 w-40 animate-shimmer" />

            {/* Role */}
            <Skeleton className="h-4 w-20 animate-shimmer" />

            {/* Actions */}
            <Skeleton className="h-8 w-8 rounded-full animate-shimmer" />
          </div>
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4">
          <Skeleton className="h-5 w-32 animate-shimmer" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md animate-shimmer" />
            <Skeleton className="h-8 w-8 rounded-md animate-shimmer" />
            <Skeleton className="h-8 w-8 rounded-md animate-shimmer" />
          </div>
        </div>
      </div>
    </section>
  );
}
