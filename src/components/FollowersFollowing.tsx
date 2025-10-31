import { useState, useEffect, useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { followUser, unfollowUser, getUserProfile } from "@/api/userApi";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
  isFollowing?: boolean;
}

interface FollowersFollowingProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FollowersFollowing({
  userId,
  isOpen,
  onClose,
}: FollowersFollowingProps) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("followers");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const context = useContext(UserContext);
  const { userData, userToken } = context || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId]);

  const loadData = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get user profile which contains followers and following arrays
      const profileData = await getUserProfile(userId, userToken || undefined);

      // Extract followers and following from profile
      const followersData = profileData.followers || [];
      const followingData = profileData.following || [];

      // Format the data to include isFollowing status
      const followingIds = localStorage.getItem("followingUsers");
      const followingList = followingIds ? JSON.parse(followingIds) : [];

      // Helper function to fetch user details if we only have ID
      const fetchUserDetails = async (user: any) => {
        if (typeof user === "string") {
          try {
            const userData = await getUserProfile(user, userToken || undefined);
            return {
              _id: userData._id,
              name: userData.name,
              username: userData.username,
              profileImage: userData.profileImage,
            };
          } catch (error) {
            return {
              _id: user,
              name: "Unknown User",
              username: "unknown",
              profileImage: undefined,
            };
          }
        } else {
          return {
            _id: user._id,
            name: user.name,
            username: user.username,
            profileImage: user.profileImage,
          };
        }
      };

      // Fetch full details for all followers and following
      const [fullFollowers, fullFollowing] = await Promise.all([
        Promise.all(followersData.map(fetchUserDetails)),
        Promise.all(followingData.map(fetchUserDetails)),
      ]);

      const formattedFollowers = fullFollowers.map((user) => ({
        ...user,
        isFollowing: followingList.includes(user._id),
      }));

      const formattedFollowing = fullFollowing.map((user) => ({
        ...user,
        isFollowing: true, // Already following them
      }));

      setFollowers(formattedFollowers);
      setFollowing(formattedFollowing);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    if (!userToken) return;

    // Get current state from UI
    const currentFollower = followers.find((u) => u._id === targetUserId);
    const currentFollowing = following.find((u) => u._id === targetUserId);
    const isCurrentlyFollowing =
      currentFollower?.isFollowing || currentFollowing?.isFollowing || false;

    // Calculate new state
    const newIsFollowing = !isCurrentlyFollowing;

    // Optimistically update UI
    setFollowers((prev) =>
      prev.map((user) =>
        user._id === targetUserId
          ? { ...user, isFollowing: newIsFollowing }
          : user
      )
    );

    // If unfollowing from Following tab, remove from list
    if (!newIsFollowing) {
      setFollowing((prev) => prev.filter((user) => user._id !== targetUserId));
    } else {
      setFollowing((prev) =>
        prev.map((user) =>
          user._id === targetUserId
            ? { ...user, isFollowing: newIsFollowing }
            : user
        )
      );
    }

    // Update localStorage
    const followingData = localStorage.getItem("followingUsers");
    const followingUsers = followingData ? JSON.parse(followingData) : [];

    if (newIsFollowing) {
      if (!followingUsers.includes(targetUserId)) {
        followingUsers.push(targetUserId);
        localStorage.setItem("followingUsers", JSON.stringify(followingUsers));
      }
    } else {
      const updated = followingUsers.filter(
        (id: string) => id !== targetUserId
      );
      localStorage.setItem("followingUsers", JSON.stringify(updated));
    }

    try {
      if (newIsFollowing) {
        await followUser(targetUserId, userToken);
      } else {
        await unfollowUser(targetUserId, userToken);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "";
      if (errorMsg.includes("Already following")) {
        const followingData = localStorage.getItem("followingUsers");
        const followingUsers = followingData ? JSON.parse(followingData) : [];
        if (!followingUsers.includes(targetUserId)) {
          followingUsers.push(targetUserId);
          localStorage.setItem(
            "followingUsers",
            JSON.stringify(followingUsers)
          );
        }

        setFollowers((prev) =>
          prev.map((user) =>
            user._id === targetUserId ? { ...user, isFollowing: true } : user
          )
        );
      } else if (errorMsg.includes("not following")) {
        const followingData = localStorage.getItem("followingUsers");
        const followingUsers = followingData ? JSON.parse(followingData) : [];
        const updated = followingUsers.filter(
          (id: string) => id !== targetUserId
        );
        localStorage.setItem("followingUsers", JSON.stringify(updated));

        setFollowers((prev) =>
          prev.map((user) =>
            user._id === targetUserId ? { ...user, isFollowing: false } : user
          )
        );
        setFollowing((prev) =>
          prev.filter((user) => user._id !== targetUserId)
        );
      }
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Followers & Following</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="followers">
                Followers ({followers.length})
              </TabsTrigger>
              <TabsTrigger value="following">
                Following ({following.length})
              </TabsTrigger>
            </TabsList>

            <div className="max-h-96 overflow-y-auto">
              <TabsContent value="followers" className="space-y-2 p-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading followers...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <Button
                      onClick={loadData}
                      variant="outline"
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No followers yet</p>
                  </div>
                ) : (
                  followers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleUserClick(user._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              user.profileImage
                                ? `http://localhost:5000/Uploads/${user.profileImage}`
                                : "/placeholder-avatar.jpg"
                            }
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-red-500 text-white">
                            {user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-gray-500 text-xs">
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      {userData?.id !== user._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(user._id);
                          }}
                          className="flex items-center space-x-1"
                        >
                          {user.isFollowing ? (
                            <>
                              <UserMinus className="h-3 w-3" />
                              <span className="text-xs">Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3" />
                              <span className="text-xs">Follow</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="following" className="space-y-2 p-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading following...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <Button
                      onClick={loadData}
                      variant="outline"
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : following.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Not following anyone yet</p>
                  </div>
                ) : (
                  following.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleUserClick(user._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              user.profileImage
                                ? `http://localhost:5000/Uploads/${user.profileImage}`
                                : "/placeholder-avatar.jpg"
                            }
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-red-500 text-white">
                            {user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-gray-500 text-xs">
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      {userData?.id !== user._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(user._id);
                          }}
                          className="flex items-center space-x-1"
                        >
                          <UserMinus className="h-3 w-3" />
                          <span className="text-xs">Following</span>
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
