import Image from "next/image";
import { IoIosDocument } from "react-icons/io";

export default function WelcomeTab() {
  return (
    <div className="flex items-center justify-between gap-8 bg-white p-6 rounded-lg">
      {/* Text Section */}
      <div className="flex-1">
        <h1 className="font-bold text-3xl mb-2">Welcome to Adlawon!</h1>
        <p className="text-lg mb-4">
          Add or paste your to-do list, and let’s start your day!
        </p>
        <button className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-md text-sm">
          <span>
            <IoIosDocument />
          </span>{" "}
          Tutorial
        </button>
      </div>

      {/* Logo Section */}
      <div className="flex-shrink-0">
        <Image
          src="/adlawon.svg"
          height={160}
          width={160}
          alt="Adlawon Logo"
          className="[filter:brightness(0)_saturate(100%)_invert(14%)_sepia(87%)_saturate(6573%)_hue-rotate(295deg)_brightness(91%)_contrast(93%)]"
        />
      </div>
    </div>
  );
}
