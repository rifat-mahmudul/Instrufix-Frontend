"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Lock } from "lucide-react";
import { changePassword } from "@/lib/api"; // <-- adjust path if needed
import { toast } from "sonner";

const passFormSchema = z
  .object({
    currentPassword: z.string().min(8, "Must be at least 8 characters"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PassFormValues = z.infer<typeof passFormSchema>;

export default function ChangePassForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [samePassAlert, setSamePassAlert] = useState(false);

  const form = useForm<PassFormValues>({
    resolver: zodResolver(passFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PassFormValues) => {
    try {
      const res = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(res.message);
      form.reset();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Request failed with status code 400") {
          setSamePassAlert(true);
        } else {
          setSamePassAlert(false);
          toast.error("Something went wrong. Please try again later.");
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold border-b pb-4">
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your current password"
                        className="pl-10 pr-10 h-12"
                      />
                      <Eye
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="pl-10 pr-10 h-12"
                      />
                      <Eye
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10 h-12"
                      />
                      <Eye
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {samePassAlert ? (
              <p className="text-sm text-red-500">
                Old password can&apos;t be used
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Use 8+ characters, uppercase, lowercase, number, and symbol.
              </p>
            )}

            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Change Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
