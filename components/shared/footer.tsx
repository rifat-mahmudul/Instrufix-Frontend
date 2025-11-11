"use client";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function Footer() {
  const pathName = usePathname();
  const router = useRouter();
  const session = useSession();
  const status = session?.status;

  useEffect(() => {
    if (status === "authenticated" && pathName === "/add-a-business") {
      router.push("/add-my-business");
    }
  }, [status, pathName, router]);

  return (
    <footer className="py-20 bg-[#139a8e]">
      <div className="container text-white">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 border-b-2 pb-10">
          <div className="col-span-2">
            <h1 className="font-bold text-2xl mb-3">Instrufix</h1>
            <p>
              Find trusted instrument repair shops near you with ease. Whether
              it’s a violin, guitar, or piano, we connect you to experts who’ll
              bring your instrument back to life. Start your search today!
            </p>
          </div>

          <div>
            <h1 className="font-semibold text-lg mb-3">For Customer</h1>
            <ul>
              <Link href={"/review-a-business"}>
                <li className="hover:underline">Write a Review</li>
              </Link>
              <Link href={"/add-a-business"}>
                <li className="hover:underline">Add a Business</li>
              </Link>
              <Link href={"/auth/login"}>
                <li className="hover:underline">Login</li>
              </Link>
            </ul>
          </div>

          <div>
            <h1 className="font-semibold text-lg mb-3">For Business</h1>
            <ul>
              <Link href={"/add-my-business"}>
                <li className="hover:underline">Add my Business</li>
              </Link>
              <Link href={"/claim-my-business"}>
                <li className="hover:underline">Claim my Business</li>
              </Link>
              <Link href={"/auth/login"}>
                <li className="hover:underline">Login</li>
              </Link>
            </ul>
          </div>

          <div>
            <h1 className="font-semibold text-lg mb-3">Contact</h1>
            <ul>
              <Link href={"https://mail.google.com/mail/"} target="_blank">
                <li className="hover:underline">contact@instrufix.com</li>
              </Link>
            </ul>
          </div>
        </div>

        <div className=" pt-10 flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <h1 className=" underline">Terms of Service</h1>
            <h1>|</h1>
            <h1 className="underline">Privacy Policy</h1>
          </div>

          <div className="flex items-center gap-5">
            <div className="bg-white text-[#139a8e] p-2 rounded-full">
              <Facebook />
            </div>

            <div className="bg-white text-[#139a8e] p-2 rounded-full">
              <Instagram />
            </div>

            <div className="bg-white text-[#139a8e] p-2 rounded-full">
              <Twitter />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
