import type React from "react";

import { useState, useContext } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserContext } from "@/context/UserContext";

interface CommentInputProps {
  onSubmit?: (content: string) => Promise<boolean>;
  placeholder?: string;
}

export function CommentInput({
  onSubmit,
  placeholder = "Write a comment...",
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const context = useContext(UserContext);
  const userData = context?.userData;

  const handleSubmit = async () => {
    if (content.trim()) {
      const success = await onSubmit?.(content.trim());
      if (success) setContent("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={
            userData?.avatar
              ? `http://localhost:5000/Uploads/${userData.avatar}`
              : "/placeholder.svg"
          }
          alt={userData?.name || "Your avatar"}
        />
        <AvatarFallback className="bg-red-500 text-white text-xs">
          {userData?.name
            ? userData.name
                .split(" ")
                .map((n) => n[0])
                .join("")
            : "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="min-h-[60px] resize-none"
        />

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            size="sm"
            className="bg-red-500 hover:bg-red-600"
          >
            <Send className="h-4 w-4 mr-2" />
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
