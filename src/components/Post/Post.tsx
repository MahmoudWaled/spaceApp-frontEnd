import { useState, useContext, useEffect } from "react";
import { Heart, MessageCircle, UserPlus, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, isTokenValid, debugToken } from "@/lib/utils";
import { Comment } from "../comment";
import { CommentInput } from "../comment-input";
import { EditDialog } from "../EditDialog";
import { CustomDropdown } from "../CustomDropdown";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import { followUser, unfollowUser } from "@/api/userApi";

interface PostUser {
  id: string;
  name: string;
  username: string;
  image?: string;
  isFollowing?: boolean;
}

interface PostComment {
  id: string;
  user: PostUser;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface PostProps {
  id: string;
  user: PostUser;
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: PostComment[];
  shares?: number;
  isLiked: boolean;
  isBookmarked?: boolean;
  currentUserId?: string;
  onLike?: () => void;
  onComment?: (content: string) => void;
  onBookmark?: () => void;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onReport?: () => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onLikeComment?: (commentId: string) => void;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
}

// Add a helper for friendly date formatting
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // seconds
  if (isNaN(date.getTime())) return dateString;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function Post({
  user,
  content,
  images = [],
  timestamp,
  likes,
  comments,
  isLiked,
  isBookmarked,
  currentUserId,
  onLike,
  onComment,
  onBookmark,
  onEdit,
  onDelete,
  onReport,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onFollowToggle,
}: PostProps) {
  const navigate = useNavigate();
  const [showAllComments, setShowAllComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const currentUser = useContext(UserContext);

  // Update isFollowing when user.isFollowing prop changes
  useEffect(() => {
    setIsFollowing(user.isFollowing || false);
  }, [user.isFollowing]);

  const formatContent = (text: string) => {
    return text.split(" ").map((word, index) => {
      if (word.startsWith("#")) {
        return (
          <span
            key={index}
            className="text-red-500 hover:text-red-600 cursor-pointer"
          >
            {word}{" "}
          </span>
        );
      }
      return word + " ";
    });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleLikeClick = () => {
    if (isLiking || !onLike) return;

    setIsLiking(true);
    onLike();

    // Reset loading state after a short delay
    setTimeout(() => {
      setIsLiking(false);
    }, 500);
  };

  const handleEditPost = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (newContent: string) => {
    onEdit?.(newContent);
  };

  const handleFollowToggle = async () => {
    if (!currentUserId || !onFollowToggle) return;

    const token = currentUser?.userToken;
    if (!token) {
      alert("Please log in to follow users.");
      return;
    }

    // Debug token if needed
    if (import.meta.env.DEV) {
      debugToken(token);
    }

    // Check if token is valid
    if (!isTokenValid(token)) {
      alert("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser(user.id, token);
        setIsFollowing(false);
        onFollowToggle(user.id, false);
      } else {
        await followUser(user.id, token);
        setIsFollowing(true);
        onFollowToggle(user.id, true);
      }
    } catch (error: any) {
      // Handle "Already following" or "Not following" errors gracefully
      const errorMsg = error.response?.data?.message || "";

      if (errorMsg.includes("Already following")) {
        // User is already following, just update UI
        setIsFollowing(true);
        onFollowToggle(user.id, true);
      } else if (
        errorMsg.includes("not following") ||
        errorMsg.includes("Not following")
      ) {
        setIsFollowing(false);
        onFollowToggle(user.id, false);
      } else {
        alert("Failed to follow/unfollow user. Please try again.");
      }
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  user.image
                    ? user.image.startsWith("http") ||
                      user.image.startsWith("/")
                      ? user.image
                      : user.image.startsWith("avatar")
                      ? `/seed-images/${user.image}`
                      : `http://localhost:5000/Uploads/${user.image}`
                    : "/placeholder.svg"
                }
                alt={user.name}
              />
              <AvatarFallback className="bg-red-500 text-white">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : null}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-muted-foreground text-xs">
                <span
                  className="hover:text-foreground cursor-pointer"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  @{user.username}
                </span>{" "}
                • {formatDate(timestamp)}
              </p>
            </div>
            {/* Follow Button - Only show if not own post and user is logged in */}
            {currentUserId && currentUserId !== user.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFollowToggle}
                className="flex items-center space-x-1 text-xs"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-3 w-3" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3" />
                    <span>Follow</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Post Actions Dropdown */}
          <CustomDropdown
            triggerClassName="h-8 w-8"
            items={[
              {
                label: `${isBookmarked ? "Remove Bookmark" : "Bookmark"}`,
                onClick: onBookmark || (() => {}),
              },
              ...(currentUserId === user.id
                ? [
                    {
                      label: "Edit Post",
                      onClick: handleEditPost,
                    },
                    {
                      label: "Delete Post",
                      onClick: onDelete || (() => {}),
                      className: "text-red-600",
                    },
                  ]
                : []),
              {
                label: "Report Post",
                onClick: onReport || (() => {}),
              },
            ]}
          />
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed">{formatContent(content)}</p>
        </div>

        {/* Post Images */}
        {images.length > 0 && (
          <div className="mb-4">
            {images.length === 1 ? (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={
                    images?.[0]
                      ? images[0].startsWith("http") ||
                        images[0].startsWith("/")
                        ? images[0]
                        : images[0].startsWith("post") ||
                          images[0].startsWith("avatar")
                        ? `/seed-images/${images[0]}`
                        : `http://localhost:5000/Uploads/${images[0]}`
                      : "/placeholder.svg"
                  }
                  alt="Post image"
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={
                      images[currentImageIndex]
                        ? images[currentImageIndex].startsWith("http") ||
                          images[currentImageIndex].startsWith("/")
                          ? images[currentImageIndex]
                          : images[currentImageIndex].startsWith("post") ||
                            images[currentImageIndex].startsWith("avatar")
                          ? `/seed-images/${images[currentImageIndex]}`
                          : `http://localhost:5000/Uploads/${images[currentImageIndex]}`
                        : "/placeholder.svg"
                    }
                    alt={`Post image ${currentImageIndex + 1}`}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                          currentImageIndex === index
                            ? "border-red-500"
                            : "border-transparent"
                        )}
                      >
                        <img
                          src={
                            img
                              ? img.startsWith("http") || img.startsWith("/")
                                ? img
                                : img.startsWith("post") ||
                                  img.startsWith("avatar")
                                ? `/seed-images/${img}`
                                : `http://localhost:5000/Uploads/${img}`
                              : "/placeholder.svg"
                          }
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between py-2 border-t border-b w-full">
          <div className="flex items-center space-x-6 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              disabled={isLiking}
              className={cn(
                "flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 flex-shrink-0",
                isLiked && "text-red-500",
                isLiking && "opacity-50 cursor-not-allowed"
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isLiked && "fill-current",
                  isLiking && "animate-pulse"
                )}
              />
              <span className="text-sm">{formatCount(likes)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex-shrink-0"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{formatCount(comments.length)}</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-4 space-y-4">
          {/* Comment Input */}
          <CommentInput
            onSubmit={async (content: string) => {
              if (onComment) {
                onComment(content);
                return true;
              }
              return false;
            }}
          />

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {(showAllComments ? comments : comments.slice(0, 3)).map(
                (comment) => (
                  <Comment
                    key={comment.id}
                    comment={{
                      ...comment,
                      timestamp: formatDate(comment.timestamp),
                    }}
                    currentUserId={currentUserId}
                    onLike={(commentId) => onLikeComment?.(commentId)}
                    onEdit={(content) => onEditComment?.(comment.id, content)}
                    onDelete={() => onDeleteComment?.(comment.id)}
                  />
                )
              )}

              {comments.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showAllComments
                    ? "Show less comments"
                    : `View ${comments.length - 3} more comments`}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <EditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
        initialContent={content}
        title="Edit Post"
        placeholder="What's on your mind?"
      />
    </Card>
  );
}
