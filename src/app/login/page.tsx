"use client";

import Image from "next/image";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-white px-4">
      <div className="flex flex-col items-center gap-8 bg-white p-8 ">
        {/* Logo and Text Side by Side */}
        <div className="flex items-center gap-6">
          <Image
            src="/adlawon.svg"
            height={100}
            width={100}
            alt="Adlawon Logo"
            className="[filter:brightness(0)_saturate(100%)_invert(14%)_sepia(87%)_saturate(6573%)_hue-rotate(295deg)_brightness(91%)_contrast(93%)]"
          />
          <div className="text-left">
            <h1 className="text-5xl font-bold">Adlawon</h1>
            <p className="text-lg text-gray-600 mt-1">Your life in control</p>
          </div>
        </div>

        <Link
          href="/api/auth"
          className="flex items-center gap-3 px-8 py-3 bg-[#A600A9] text-white rounded-md font-semibold hover:bg-[#a600a9c8] transition-colors"
        >
          <FaGoogle className="w-5 h-5" />
          <span>Sign in with Google</span>
        </Link>
      </div>
    </div>
  );
}
