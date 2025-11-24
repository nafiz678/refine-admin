import { useQuery } from "@tanstack/react-query";
import BannerDialog from "./banner-dialog";
import BannerList from "./banner-list";
import { supabaseClient } from "@/lib";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="space-y-5 mt-8">
        <div className="flex items-center justify-center font-geist text-xl lg:text-3xl">
          Banners
        </div>
        <div className="my-5 flex items-center justify-end">
          <BannerDialog type="insert" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Skeleton
                key={index}
                className="h-80 w-full rounded-lg"
              />
            ))}
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="h-[70%]">
        <p className="mt-8 flex items-center justify-center font-geist text-xl lg:text-3xl">
          Banners{" "}
        </p>
        <div className="my-5 flex items-center justify-end">
          <BannerDialog type="insert" />
        </div>
        <p className="flex h-[70%] items-center justify-center text-red-600 text-xl">
          No banners found
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <p className="mt-8 flex items-center justify-center font-geist text-xl lg:text-3xl">
        Banners{" "}
      </p>
      <div className="my-5 flex items-center justify-end">
        <BannerDialog
          type="insert"
          refetchBanners={refetchBanners}
        />
      </div>
      <BannerList
        banners={banners}
        refetchBanners={refetchBanners}
      />
    </div>
  );
};

export default Banner;
