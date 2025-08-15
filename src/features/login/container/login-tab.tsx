"use client";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";

export default function LoginTab() {
  return (
    <>
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="flex my-24">
          <div>
            <Image
              src="/adlawon.svg"
              height={70}
              width={70}
              alt="Adlawon Logo"
              className="[filter:brightness(0)_saturate(100%)_invert(14%)_sepia(87%)_saturate(6573%)_hue-rotate(295deg)_brightness(91%)_contrast(93%)]"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-bold text-6xl">Adlawon</h1>
            <p className="text-xl">Your life in control</p>
          </div>
        </div>
        <div>
          <button
            className="flex items-center gap-2 bg-[#A600A9] text-white font-bold px-3 py-4 rounded-lg"
            onClick={async () => {
              try {
                const response = await fetch("/api/auth");
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
              } catch (error: any) {
                console.error("Error fetching data: ", error);
              }
            }}
          >
            <FaGoogle className="w-6 h-6" /> <span>Log in using Google</span>
          </button>
        </div>
      </div>
    </>
  );
}
