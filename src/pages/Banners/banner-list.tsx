import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import BannerDialog from "./banner-dialog";
import DeleteBannerPage from "./delete-banner";
import { Database } from "@/lib/supabase";
import { QueryObserverResult } from "@tanstack/react-query";

export type BannerProp = Database["content"]["Tables"]["banner"]["Row"] 

type RefetchType = () => Promise<QueryObserverResult>;

type Props = {
  banners: BannerProp[];
  refetchBanners?: RefetchType
};

const BannerList = ({ banners, refetchBanners }: Props) => {
  return (
    <section className="py-8">
      <div className="flex flex-wrap justify-center gap-8 xl:justify-start">
        {banners.map((banner) => (
          <Card
            key={banner.id}
            className="flex flex-col w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            {/* Image Section */}
            <div className="relative w-full h-40 sm:h-48 md:h-56 overflow-hidden">
              <img
                src={banner.images[0] || "/placeholder.svg"}
                alt={banner.title}
                loading="lazy"
                className=" h-full w-full object-cover transition-transform duration-300 hover:scale-110 "
              />
            </div>

            {/* Content */}
            <CardContent className="flex flex-col items-center gap-2 px-3 py-3 text-center">
              <CardTitle className="font-semibold text-base sm:text-lg truncate">
                {banner.title}
              </CardTitle>

              <CardDescription className="text-xs sm:text-sm line-clamp-2">
                {banner.description}
              </CardDescription>
            </CardContent>

            {/* Footer */}
            <CardFooter className="flex w-full justify-between border-t px-3 py-2 gap-2">
              <BannerDialog
                bannerInfo={banner}
                type="update"
              />
              <DeleteBannerPage bannerId={banner.id} refetchBanners={refetchBanners}/>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default BannerList;
