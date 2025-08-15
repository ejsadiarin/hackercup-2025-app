import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

export const fetchMyProfile = async () => {
  const myId = await getCurrentUserId();
  if (myId) {
    const response = await fetch(`/api/users/${myId}`);
    if (response.ok) {
      const myProfile = await response.json();
      return myProfile;
    }
  }
  return null;
};
