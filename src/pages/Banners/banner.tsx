import { useQuery } from "@tanstack/react-query";
import BannerDialog from "./banner-dialog";
import BannerList from "./banner-list";
import { supabaseClient } from "@/lib";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/refine-ui/layout/page-header";

const Banner = () => {
  const {
    data: banners,
    isLoading,
    refetch: refetchBanners,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .schema("content")
        .from("banner")
        .select("*");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8 space-y-8">
        <PageHeader
          title="Banners"
          subtitle={`Manage your banners`}
        />

        {/* Add button */}
        <div className="flex justify-end">
          <BannerDialog type="insert" />
        </div>

        {/* Loading skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Skeleton
                key={index}
                className="h-80 w-full rounded-xl"
              />
            ))}
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8 space-y-8">
        <div className="space-y-2 flex items-center justify-between">
          <PageHeader
            title="Banners"
            subtitle={`Manage your ${banners?.length} banners`}
          />

          <div className="flex justify-end">
            <BannerDialog
              type="insert"
              refetchBanners={refetchBanners}
            />
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 py-12">
          <div className="p-3 bg-muted rounded-full">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">
              No banners yet
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Create your first banner to get started.
              Banners help you highlight promotions and
              important messages.
            </p>
          </div>
          <BannerDialog
            type="insert"
            refetchBanners={refetchBanners}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8">
      <div className="space-y-2 flex items-center justify-between">
        <PageHeader
          title="Banners"
          subtitle={`Manage your ${banners.length} banners`}
        />

        {/* Action bar */}
        <div className="flex justify-end">
          <BannerDialog
            type="insert"
            refetchBanners={refetchBanners}
          />
        </div>
      </div>

      {/* Banner list */}
      <BannerList
        banners={banners}
        refetchBanners={refetchBanners}
      />
    </div>
  );
};

export default Banner;
