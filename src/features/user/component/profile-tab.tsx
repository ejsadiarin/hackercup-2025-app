"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchMyProfile } from "@/utils/session";

type Profile = {
  full_name: string;
  avatar_url: string;
};

export default function ProfileTab() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const profileData = await fetchMyProfile();
      setProfile(profileData);
    };
    getProfile();
  }, []);

  return (
    <>
      <div>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback>
              {profile?.full_name ? profile.full_name.charAt(0) : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-4xl">
              {profile?.full_name.split(" ")[0] || "Loading..."}
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}
