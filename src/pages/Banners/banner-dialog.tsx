import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PenIcon } from "lucide-react";
import { useState } from "react";
import BannerForm from "./banner-form";
import { BannerProp } from "./banner-list";
import { QueryObserverResult } from "@tanstack/react-query";

const BannerDialog = ({ type, bannerInfo, refetchBanners }: props) => {
  const [isOpen, setIsOpen] = useState(false);
  function handleDialog() {
    setIsOpen(!isOpen);
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          size={type === "insert" ? "default" : "icon"}
          variant={
            type === "insert" ? "default" : "outline"
          }
        >
          {type === "insert" ? (
            "Add"
          ) : (
            <PenIcon size={20} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[70vw] sm:w-[80vw] rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {type === "insert"
              ? "Add New Banner"
              : "Edit Banner"}
          </DialogTitle>
        </DialogHeader>
        <BannerForm
          bannerInfo={bannerInfo}
          handleDialog={handleDialog}
          refetchBanners={refetchBanners}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BannerDialog;

type RefetchType = () => Promise<QueryObserverResult>;

type props = {
  type: "insert" | "update";
  bannerInfo?: BannerProp
  refetchBanners?: RefetchType
};