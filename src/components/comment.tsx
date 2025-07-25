"use client";

import { useState } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EditDialog } from "./EditDialog";

interface CommentUser {
  id: string;
  name: string;
  username: string;
  image?: string;
}

interface CommentProps {
  comment: {
    id: string;
    user: CommentUser;
    content: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
  };
  onLike?: () => void;
  onReply?: () => void;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onReport?: () => void;
}

export function Comment({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onReport,
}: CommentProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike?.();
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleEditComment = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (newContent: string) => {
    onEdit?.(newContent);
  };
  return (
    <div className="flex space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={
            comment.user.image
              ? `http://localhost:5000/Uploads/${comment.user.image}`
              : "/placeholder.svg"
          }
          alt={comment.user.name}
        />
        <AvatarFallback className="bg-red-500 text-white text-xs">
          {comment.user.name
            ? comment.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
            : null}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-semibold text-xs">{comment.user.name}</p>
            <p className="text-muted-foreground text-xs">
              @{comment.user.username}
            </p>
            <p className="text-muted-foreground text-xs">•</p>
            <p className="text-muted-foreground text-xs">{comment.timestamp}</p>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "flex items-center space-x-1 h-6 px-2 hover:bg-red-50 dark:hover:bg-red-950/20",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
              {likes > 0 && (
                <span className="text-xs">{formatCount(likes)}</span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onReply}
              className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
            >
              Reply
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditComment}>
                Edit Comment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete Comment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onReport}>
                Report Comment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
        initialContent={comment.content}
        title="Edit Comment"
        placeholder="Edit your comment..."
      />
    </div>
  );
}
