import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useFollow = (targetUserId?: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(async (uid: string) => {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", uid),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", uid),
    ]);
    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);
  }, []);

  const checkFollowing = useCallback(async (myId: string, targetId: string) => {
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", myId)
      .eq("following_id", targetId)
      .maybeSingle();
    setIsFollowing(!!data);
  }, []);

  useEffect(() => {
    if (!targetUserId) return;
    fetchCounts(targetUserId);
    if (user && user.id !== targetUserId) {
      checkFollowing(user.id, targetUserId);
    }
  }, [targetUserId, user, fetchCounts, checkFollowing]);

  const toggleFollow = async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;
    setLoading(true);
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
    }
    setLoading(false);
  };

  return { isFollowing, followersCount, followingCount, loading, toggleFollow };
};
