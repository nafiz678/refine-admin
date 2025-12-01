import { useState } from "react";

import { CircleHelp, Loader2 } from "lucide-react";

import { InputPassword } from "@/components/refine-ui/form/input-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useLink,
  useLogin,
  useRefineOptions,
} from "@refinedev/core";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const SignInForm = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const Link = useLink();

  const { title } = useRefineOptions();

  const { mutateAsync: login } = useLogin();

  const handleSignIn = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setIsLoading(true);

    try {
      const res = await login({
        email: email.trim(),
        password,
      });

      // If refine login provider returns an error shape
      if (res?.error) {
        toast.error(res.error.message || "Login failed");
        return;
      }

      toast.success("Logged in successfully");
      navigate("/");
    } catch (err) {
      toast.error("Something went wrong. Try again." + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "px-6",
        "py-8",
        "min-h-svh"
      )}
    >
      <div
        className={cn(
          "flex",
          "items-center",
          "justify-center"
        )}
      >
        {title.icon && (
          <div
            className={cn(
              "text-foreground",
              "[&>svg]:w-12",
              "[&>svg]:h-12"
            )}
          >
            {title.icon}
          </div>
        )}
      </div>

      <Card className={cn("sm:w-[456px]", "p-12", "mt-6")}>
        <CardHeader className={cn("px-0")}>
          <CardTitle
            className={cn(
              "text-blue-600",
              "dark:text-blue-400",
              "text-3xl",
              "font-semibold"
            )}
          >
            Sign in
          </CardTitle>
          <CardDescription
            className={cn(
              "text-muted-foreground",
              "font-medium"
            )}
          >
            Welcome back
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className={cn("px-0")}>
          <form onSubmit={handleSignIn}>
            <div
              className={cn("flex", "flex-col", "gap-2")}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div
              className={cn(
                "relative",
                "flex",
                "flex-col",
                "gap-2",
                "mt-6"
              )}
            >
              <Label htmlFor="password">Password</Label>
              <InputPassword
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            <div
              className={cn(
                "flex items-center justify-between",
                "flex-wrap",
                "gap-2",
                "mt-4"
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  "space-x-2"
                )}
              >
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(
                      checked === "indeterminate"
                        ? false
                        : checked
                    )
                  }
                />
                <Label htmlFor="remember">
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className={cn(
                  "text-sm",
                  "flex",
                  "items-center",
                  "gap-2",
                  "text-primary hover:underline",
                  "text-blue-600",
                  "dark:text-blue-400"
                )}
              >
                <span>Forgot password</span>
                <CircleHelp className={cn("w-4", "h-4")} />
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className={cn("w-full", "mt-6")}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>

            <div
              className={cn(
                "flex",
                "items-center",
                "gap-4",
                "mt-6"
              )}
            >
              <Separator className={cn("flex-1")} />
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <div
            className={cn("w-full", "text-center text-sm")}
          >
            <span
              className={cn(
                "text-sm",
                "text-muted-foreground"
              )}
            >
              No account?{" "}
            </span>
            <Link
              to="/register"
              className={cn(
                "text-green-600",
                "dark:text-green-400",
                "font-semibold",
                "underline"
              )}
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

SignInForm.displayName = "SignInForm";
