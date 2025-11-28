"use client";

import { useState } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useLink,
  useNotification,
  useRefineOptions,
  useRegister,
} from "@refinedev/core";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { open } = useNotification();

  const Link = useLink();

  const { title } = useRefineOptions();

  const { mutateAsync: register } = useRegister();

  const handleSignUp = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      open?.({
        type: "error",
        message: "Passwords don't match",
        description:
          "Please make sure both password fields contain the same value.",
      });
      return;
    }
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await register({
        email: email.trim(),
        password,
      });

      console.log("REGISTER RESPONSE:", res);

      // Supabase error format
      if (res?.error) {
        toast.error(res.error.message || "Signup failed");
        return;
      }

      if (res?.status >= 400) {
        toast.error(res?.error?.message || "Signup failed");
        return;
      }

      // success
      toast.success("User signed up successfully");
      navigate("/");
    } catch (error) {
      toast.error(
        "Unexpected error occurred during signup."
      );
      console.error("Signup error:", error);
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
          "justify-center",
          "gap-2"
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
              "text-green-600",
              "dark:text-green-400",
              "text-3xl",
              "font-semibold"
            )}
          >
            Sign up
          </CardTitle>
          <CardDescription
            className={cn(
              "text-muted-foreground",
              "font-medium"
            )}
          >
            Welcome to Millennial.
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className={cn("px-0")}>
          <form onSubmit={handleSignUp}>
            <div
              className={cn("flex", "flex-col", "gap-2")}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                required
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
                id="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
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
              <Label htmlFor="confirmPassword">
                Confirm password
              </Label>
              <InputPassword
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
        </CardContent>

        <Separator />

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
              Have an account?{" "}
            </span>
            <Link
              to="/login"
              className={cn(
                "text-blue-600",
                "dark:text-blue-400",
                "font-semibold",
                "underline"
              )}
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

SignUpForm.displayName = "SignUpForm";
