"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, User, Lock, Loader } from "lucide-react"
import { registerUser } from '@/app/actions/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const signUpFormSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    userType: z.enum(["user", "businessMan"]),
})

export default function SignupForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const [error, setError] = useState<string>("")

    const signUpForm = useForm<z.infer<typeof signUpFormSchema>>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            userType: "user",
        },
    })

    const onSubmit = async (values: z.infer<typeof signUpFormSchema>) => {
        setIsLoading(true)
        try {
            const res = await registerUser(values)
            console.log(res)
            if (res.success === true) {
                toast.success(res.message)
                router.push(`/auth/verify-email?token=${res?.data?.accessToken}&type=signup`)
            } else {
                setError(res?.message)
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message)
            }
            toast.error("Something went wrong. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="lg:py-20 py-10 flex justify-center items-center">
            <div className="max-w-3xl mx-auto w-full px-4">
                <div className="text-center space-y-4 lg:pb-10">
                    <h2 className='lg:text-3xl font-bold'>Sign Up</h2>
                    <p className='text-[#485150] lg:text-base'>Please enter your details to create a new account</p>
                </div>
                <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(onSubmit)} className="lg:space-y-6 space-y-3">
                        {/* Full Name */}
                        <FormField
                            control={signUpForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <Input className="pl-10 h-14 bg-[#F7F8F8] border border-[#E7E9E9]" placeholder="Please enter your name" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email */}
                        <FormField
                            control={signUpForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <Input className="pl-10 h-14 bg-[#F7F8F8] border border-[#E7E9E9]" placeholder="Enter your email" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password */}
                        <FormField
                            control={signUpForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <Input
                                                className="pl-10 h-14 bg-[#F7F8F8] border border-[#E7E9E9] pr-10"
                                                placeholder="Enter your password"
                                                type={showPassword ? "text" : "password"}
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                                onClick={() => setShowPassword(prev => !prev)}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* User Type */}
                        <FormField
                            control={signUpForm.control}
                            name="userType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='bg-[#F7F8F8] h-14'>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="user">Customer</SelectItem>
                                            <SelectItem value="businessMan">Business Owner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {
                            error && (
                                error == "User already exists" ?
                                    (
                                        <p className='text-center'>Looks like you already have an account—try <Link href="/auth/login" className='text-[#00998E] underline'>logging in.</Link></p>
                                    )
                                    :
                                    (
                                        <p className='text-center'>{error}</p>
                                    )
                            )
                        }

                        {/* Submit */}
                        <Button disabled={isLoading} type="submit" className="w-full">
                            {isLoading && (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign Up
                        </Button>

                        <div className="flex justify-between items-center">
                            <Link href="/auth/login" className="text-sm text-[#485150]">Have an account?</Link>
                            <Link href="/auth/login" className="text-sm text-blue-400 underline">Log In</Link>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm text-muted-foreground">
                            By signing up, you agree to our{" "}
                            <span className="underline cursor-pointer">Terms and Conditions</span> and{" "}
                            <span className="underline cursor-pointer">Privacy Policy</span>.
                        </p>
                    </form>
                </Form>
            </div>
        </section>
    )
}
