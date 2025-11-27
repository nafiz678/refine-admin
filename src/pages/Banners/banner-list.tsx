import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import BannerDialog from "./banner-dialog";
import DeleteBannerPage from "./delete-banner";
import type { Database } from "@/lib/supabase";
import type { QueryObserverResult } from "@tanstack/react-query";

export type BannerProp =
  Database["content"]["Tables"]["banner"]["Row"];

type RefetchType = () => Promise<QueryObserverResult>;

type Props = {
  banners: BannerProp[];
  refetchBanners?: RefetchType;
};

const BannerList = ({ banners, refetchBanners }: Props) => {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card
            key={banner.id}
            className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg h-full pt-0"
          >
            <div className="relative w-full h-48 md:h-56 overflow-hidden bg-muted">
              <img
                src={`${
                  import.meta.env.VITE_SUPABASE_URL
                }/storage/v1/object/public/${
                  banner.images[0]
                }`}
                alt={banner.title}
                onError={(e) => {
                  e.currentTarget.src = "/fallback.jpg";
                }}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            </div>

            <CardContent className="flex flex-col gap-2 px-4 py-4 flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {banner.title}
              </CardTitle>

              <CardDescription className="text-xs md:text-sm line-clamp-2 text-muted-foreground">
                {banner.description ||
                  "No description provided"}
              </CardDescription>

              {banner.link && (
                <div className="text-xs text-primary/70 line-clamp-1 mt-1">
                  <span className="font-medium">Link:</span>{" "}
                  {banner.link}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex w-full justify-between gap-2 border-t px-4 py-3 bg-muted/40">
              <BannerDialog
                bannerInfo={banner}
                type="update"
              />
              <DeleteBannerPage
                bannerId={banner.id}
                refetchBanners={refetchBanners}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default BannerList;
