import { useState, useEffect, useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import {
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
} from "@/api/userApi";
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

  const isOwnProfile = userData?.id === userId;

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
      const [followersData, followingData] = await Promise.all([
        getFollowers(userId, userToken || undefined),
        getFollowing(userId, userToken || undefined),
      ]);

      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (error: any) {
      console.error("Error loading followers/following:", error);
      setError(error.response?.data?.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async (
    targetUserId: string,
    isCurrentlyFollowing: boolean
  ) => {
    if (!userToken) return;

    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(targetUserId, userToken);
        // Update both lists
        setFollowers((prev) =>
          prev.map((user) =>
            user._id === targetUserId ? { ...user, isFollowing: false } : user
          )
        );
        setFollowing((prev) =>
          prev.map((user) =>
            user._id === targetUserId ? { ...user, isFollowing: false } : user
          )
        );
      } else {
        await followUser(targetUserId, userToken);
        // Update both lists
        setFollowers((prev) =>
          prev.map((user) =>
            user._id === targetUserId ? { ...user, isFollowing: true } : user
          )
        );
        setFollowing((prev) =>
          prev.map((user) =>
            user._id === targetUserId ? { ...user, isFollowing: true } : user
          )
        );
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
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

                      {!isOwnProfile && userData?.id !== user._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(
                              user._id,
                              user.isFollowing || false
                            );
                          }}
                          className="flex items-center space-x-1"
                        >
                          {user.isFollowing ? (
                            <>
                              <UserMinus className="h-3 w-3" />
                              <span className="text-xs">Unfollow</span>
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

                      {!isOwnProfile && userData?.id !== user._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(
                              user._id,
                              user.isFollowing || false
                            );
                          }}
                          className="flex items-center space-x-1"
                        >
                          {user.isFollowing ? (
                            <>
                              <UserMinus className="h-3 w-3" />
                              <span className="text-xs">Unfollow</span>
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
