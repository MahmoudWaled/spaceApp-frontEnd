import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CommentInputProps {
  onSubmit?: (content: string) => void
  placeholder?: string
}

export function CommentInput({ onSubmit, placeholder = "Write a comment..." }: CommentInputProps) {
  const [content, setContent] = useState("")

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit?.(content.trim())
      setContent("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src="/placeholder-avatar.jpg" alt="Your avatar" />
        <AvatarFallback className="bg-red-500 text-white text-xs">U</AvatarFallback>
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
          <Button onClick={handleSubmit} disabled={!content.trim()} size="sm" className="bg-red-500 hover:bg-red-600">
            <Send className="h-4 w-4 mr-2" />
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
