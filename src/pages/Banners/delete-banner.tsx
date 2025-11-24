import { Trash } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { supabaseClient } from "@/lib";
import { QueryObserverResult } from "@tanstack/react-query";

type RefetchType = () => Promise<QueryObserverResult>;

interface DeleteBannerProps {
  bannerId: string;
  refetchBanners?: RefetchType;
}

const DeleteBannerPage = ({ bannerId, refetchBanners }: DeleteBannerProps) => {
  const [isPending, startTransition] = useTransition();

  const deleteBanner = () => {
    startTransition(async () => {
      try {
        const { error } = await supabaseClient
          .schema("content")
          .from("banner")
          .delete()
          .eq("id", bannerId);

        if (error) {
          toast.error(`Failed to delete banner: ${error.message}`);
          return;
        }

        toast.success("Banner deleted successfully!");
        refetchBanners?.(); 
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while deleting the banner.");
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="hover:cursor-pointer"
          size="icon"
          variant="destructive"
        >
          <Trash size={20} />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your banner and{" "}
            <span className="text-destructive">also remove its related products.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={deleteBanner}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBannerPage;
