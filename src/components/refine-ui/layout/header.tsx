import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetIdentity,
  useLogout,
  useRefineOptions,
} from "@refinedev/core";
import { LogOut, User } from "lucide-react";

export const Header = () => {
  const { isMobile } = useSidebar();

  return (
    <>{isMobile ? <MobileHeader /> : <DesktopHeader />}</>
  );
};

function DesktopHeader() {
  const { open } = useSidebar();
  return (
    <header
      className={cn(
        "sticky top-0 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-sidebar pr-3 justify-between z-40"
      )}
    >
      <SidebarTrigger
        className={`text-muted-foreground transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <div className="flex items-center gap-4 bg-sidebar pr-3 justify-end z-40">
        <ThemeToggle />
        <UserSection />
      </div>
    </header>
  );
}

function MobileHeader() {
  const { open, isMobile } = useSidebar();

  const { title } = useRefineOptions();

  return (
    <header
      className={cn(
        "sticky",
        "top-0",
        "flex",
        "h-12",
        "shrink-0",
        "items-center",
        "gap-2",
        "border-b",
        "border-border",
        "bg-sidebar",
        "pr-3",
        "justify-between",
        "z-40"
      )}
    >
      <SidebarTrigger
        className={cn(
          "text-muted-foreground",
          "rotate-180",
          "ml-1",
          {
            "opacity-0": open,
            "opacity-100": !open || isMobile,
            "pointer-events-auto": !open || isMobile,
            "pointer-events-none": open && !isMobile,
          }
        )}
      />

      <div
        className={cn(
          "whitespace-nowrap",
          "flex",
          "flex-row",
          "h-full",
          "items-center",
          "justify-start",
          "gap-2",
          "transition-discrete",
          "duration-200",
          {
            "pl-3": !open,
            "pl-5": open,
          }
        )}
      >
        <div>{title.icon}</div>
        <h2
          className={cn(
            "text-sm",
            "font-bold",
            "transition-opacity",
            "duration-200",
            {
              "opacity-0": !open,
              "opacity-100": open,
            }
          )}
        >
          {title.text}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle className={cn("h-8 w-8")} />
        <UserSection />
      </div>
    </header>
  );
}

export const UserSection = () => {
  const authProvider = useGetIdentity();
  const { mutate: logout, isPending: isLoggingOut } =
    useLogout();

  const user = authProvider?.data;
  const isLoggedIn = !!user;

  // While loading identity
  if (authProvider.isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-18 h-4" />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="relative w-10 h-10 cursor-pointer group">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-foreground  to-foreground opacity-60 group-hover:opacity-100 blur-[2px] transition" />
            <div className="relative">
              <UserAvatar />
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-64 p-3 rounded-xl shadow-xl border bg-card"
        >
          {/* Profile header */}
          <DropdownMenuLabel className="font-normal p-0">
            <div className="flex items-center gap-3">
              <UserAvatar/>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {user.user_metadata?.name || user.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Profile button */}
          <DropdownMenuItem
            disabled
            className="flex items-center gap-2 text-sm opacity-60 cursor-not-allowed"
          >
            <User className="h-4 w-4" />
            Profile (coming soon)
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            onClick={() => logout()}
            className="flex items-center gap-2 text-red-600 focus:text-red-600 font-medium cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging Out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        onClick={() => (window.location.href = "/login")}
        className="px-4"
      >
        Login
      </Button>

      <Button
        variant="outline"
        onClick={() => (window.location.href = "/register")}
        className="px-4"
      >
        Register
      </Button>
    </div>
  );
};

Header.displayName = "Header";
MobileHeader.displayName = "MobileHeader";
DesktopHeader.displayName = "DesktopHeader";
