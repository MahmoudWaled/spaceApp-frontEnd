import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Bookmark,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Comment } from "../comment";
import { CommentInput } from "../comment-input";
import { EditDialog } from "../EditDialog";

interface PostUser {
  id: string;
  name: string;
  username: string;
  image?: string;
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
  onLike?: () => void;
  onComment?: (content: string) => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onReport?: () => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export function Post({
  id,
  user,
  content,
  images = [],
  timestamp,
  likes,
  comments,
  shares,
  isLiked,
  isBookmarked,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onEdit,
  onDelete,
  onReport,
  onEditComment,
  onDeleteComment,
}: PostProps) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
                    ? `http://localhost:5000/Uploads/${user.image}`
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
            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-muted-foreground text-xs">
                @{user.username} • {timestamp}
              </p>
            </div>
          </div>

          {/* Post Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onBookmark}>
                <Bookmark
                  className={cn("mr-2 h-4 w-4", isBookmarked && "fill-current")}
                />
                {isBookmarked ? "Remove Bookmark" : "Bookmark"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEditPost}>
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete Post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onReport}>
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                      ? `http://localhost:5000/Uploads/${images[0]}`
                      : "/placeholder.svg"
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={
                      images[currentImageIndex]
                        ? `http://localhost:5000/Uploads/${images[currentImageIndex]}`
                        : "/placeholder.svg"
                    }
                    alt={`Post image ${currentImageIndex + 1}`}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
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
                            images[currentImageIndex]
                              ? `http://localhost:5000/Uploads/${images[currentImageIndex]}`
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
        <div className="flex items-center justify-between py-2 border-t border-b">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              disabled={isLiking}
              className={cn(
                "flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200",
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
              className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{formatCount(comments.length)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="flex items-center space-x-2 hover:bg-green-50 dark:hover:bg-green-950/20"
            >
              <Share className="h-4 w-4" />
              <span className="text-sm">
                {shares ? formatCount(shares) : null}
              </span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-4 space-y-4">
          {/* Comment Input */}
          <CommentInput onSubmit={onComment} />

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {(showAllComments ? comments : comments.slice(0, 3)).map(
                (comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
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
