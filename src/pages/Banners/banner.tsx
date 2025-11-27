import { useQuery } from "@tanstack/react-query";
import BannerDialog from "./banner-dialog";
import BannerList from "./banner-list";
import { supabaseClient } from "@/lib";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, AlertCircle } from "lucide-react";

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
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Banners
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your promotional banners
          </p>
        </div>

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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="size-10 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Banners
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your active banners
              </p>
            </div>
          </div>

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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="size-10 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Banners
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage {banners.length} active banner
              {banners.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

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
