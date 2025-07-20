import React, { useEffect, useState } from "react";
import { Post } from "../../components/Post/Post";
import {
  getPosts,
  toggleLikePost,
  addComment,
  deletePost,
  updatePost,
  deleteComment,
  updateComment,
} from "@/api/postApi";
import { UserContext } from "@/context/UserContext";

type CommentType = {
  _id: string;
  text: string;
  author: {
    _id: string;
    username: string;
    name: string;
    profileImage: string;
  };
  createdAt: string;
  likes: string[];
};

type PostType = {
  _id: string;
  content: string;
  image: string | null;
  author: {
    _id: string;
    username: string;
    name: string;
    profileImage: string;
  };
  createdAt: string;
  updatedAt: string;
  comments: CommentType[];
  likes: { username: string; _id: string }[];
  isLiked: boolean;
};
type PostUser = {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
};
type PostComment = {
  id: string;
  user: PostUser;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
};

export function HomePage() {
  const context = React.useContext(UserContext);
  if (!context) throw new Error("UserContext missing");
  const { userData } = context;
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    console.log("Fetching posts...");
    const response = getPosts();
    response().then((data) => {
      console.log("Posts fetched:", data.length, "posts");
      setPosts(data);
    });
  }, []);

  function handleLike(postId: string) {
    if (!context?.userToken) {
      console.error("User not authenticated");
      return;
    }

    // Optimistically update the UI first
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;

        const userId = context?.userData?.id;
        const username = context?.userData?.username;
        const alreadyLiked = post.likes.some((like) => like._id === userId);

        const updatedLikes = alreadyLiked
          ? post.likes.filter((like) => like._id !== userId)
          : [...post.likes, { _id: userId!, username: username! }];

        return {
          ...post,
          likes: updatedLikes,
          isLiked: !alreadyLiked,
        };
      })
    );

    // Then make the API call
    toggleLikePost(postId, context.userToken)
      .then(() => {
        // API call successful, no need to update state again
        console.log("Like toggled successfully");
      })
      .catch((err) => {
        console.error("Error toggling like:", err);
        // Revert the optimistic update on error
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id !== postId) return post;

            const userId = context?.userData?.id;
            const username = context?.userData?.username;
            const alreadyLiked = post.likes.some((like) => like._id === userId);

            const updatedLikes = alreadyLiked
              ? post.likes.filter((like) => like._id !== userId)
              : [...post.likes, { _id: userId!, username: username! }];

            return {
              ...post,
              likes: updatedLikes,
              isLiked: !alreadyLiked,
            };
          })
        );
        // Optionally show a user-friendly error message
      });
  }

  const handleDeletePost = (postId: string) => {
    if (!context?.userToken) {
      console.error("User not authenticated");
      return;
    }

    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    // Optimistically remove the post from UI
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));

    // Make the API call
    deletePost(postId, context.userToken)
      .then(() => {
        console.log("Post deleted successfully");
      })
      .catch((err) => {
        console.error("Error deleting post:", err);
        alert("Failed to delete post. Please try again.");
        // Revert the optimistic update on error
        const response = getPosts();
        response().then((data) => setPosts(data));
      });
  };

  const handleEditPost = (postId: string, newContent: string) => {
    if (!context?.userToken) {
      console.error("User not authenticated");
      return;
    }

    // Optimistically update the post in UI
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;
        return {
          ...post,
          content: newContent,
        };
      })
    );

    // Make the API call
    updatePost(postId, newContent, context.userToken)
      .then((response) => {
        console.log("Post updated successfully:", response);
      })
      .catch((err) => {
        console.error("Error updating post:", err);
        alert("Failed to update post. Please try again.");
        // Revert the optimistic update on error
        const response = getPosts();
        response().then((data) => setPosts(data));
      });
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    if (!context?.userToken) {
      console.error("User not authenticated");
      return;
    }

    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    // Optimistically remove the comment from UI
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;
        return {
          ...post,
          comments: post.comments.filter(
            (comment) => comment._id !== commentId
          ),
        };
      })
    );

    // Make the API call
    deleteComment(commentId, context.userToken)
      .then(() => {
        console.log("Comment deleted successfully");
      })
      .catch((err) => {
        console.error("Error deleting comment:", err);
        alert("Failed to delete comment. Please try again.");
        // Revert the optimistic update on error
        const response = getPosts();
        response().then((data) => setPosts(data));
      });
  };

  const handleEditComment = (
    postId: string,
    commentId: string,
    newContent: string
  ) => {
    if (!context?.userToken) {
      console.error("User not authenticated");
      return;
    }

    // Optimistically update the comment in UI
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;
        return {
          ...post,
          comments: post.comments.map((comment) => {
            if (comment._id !== commentId) return comment;
            return {
              ...comment,
              text: newContent,
            };
          }),
        };
      })
    );

    // Make the API call
    updateComment(commentId, newContent, context.userToken)
      .then((response) => {
        console.log("Comment updated successfully:", response);
      })
      .catch((err) => {
        console.error("Error updating comment:", err);
        alert("Failed to update comment. Please try again.");
        // Revert the optimistic update on error
        const response = getPosts();
        response().then((data) => setPosts(data));
      });
  };

  const handleComment = (postId: string, content: string) => {
    if (!context?.userToken) {
      console.error("User not authenticated");
      return;
    }

    console.log("Adding comment to post:", postId, "Content:", content);

    const tempId = `temp-${Date.now()}`;

    // Optimistically add the comment to the UI
    const newComment: CommentType = {
      _id: tempId,
      text: content,
      author: {
        _id: context.userData?.id || "",
        username: context.userData?.username || "",
        name: context.userData?.name || "",
        profileImage: context.userData?.avatar || "",
      },
      createdAt: new Date().toISOString(),
      likes: [],
    };

    console.log("Optimistic comment:", newComment);

    // Add the comment optimistically
    setPosts((prevPosts) => {
      console.log("Current posts before update:", prevPosts.length);
      const updatedPosts = prevPosts.map((post) => {
        if (post._id !== postId) return post;
        console.log(
          "Adding comment to post:",
          post._id,
          "Current comments:",
          post.comments.length
        );
        const updatedPost = {
          ...post,
          comments: [...post.comments, newComment],
        };
        console.log("Updated post comments:", updatedPost.comments.length);
        return updatedPost;
      });
      console.log("Updated posts:", updatedPosts.length);
      return updatedPosts;
    });

    // Make the API call
    addComment(postId, content, context.userToken!)
      .then((response) => {
        console.log("Comment added successfully:", response);
        console.log("Response data:", response);

        // If the API returns the actual comment, replace the temporary one
        if (response && response._id) {
          setPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post._id !== postId) return post;
              return {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === tempId ? response : comment
                ),
              };
            })
          );
        }
      })
      .catch((err) => {
        console.error("Error adding comment:", err);
        console.error("Error details:", err.response?.data || err.message);
        console.error("Error status:", err.response?.status);

        // Show user-friendly error message
        alert("Failed to save comment. Please try again.");

        // Remove the optimistic comment on any error
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id !== postId) return post;
            return {
              ...post,
              comments: post.comments.filter(
                (comment) => comment._id !== tempId
              ),
            };
          })
        );
      });
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-center">Welcome to Space</h1>

        <div className="space-y-6">
          {posts?.map((post) => (
            <Post
              key={post._id}
              id={post._id}
              images={post.image ? [post.image] : []}
              comments={post.comments.map((comment: any) => ({
                id: comment._id,
                content: comment.text,
                timestamp: comment.createdAt,
                likes: Array.isArray(comment.likes) ? comment.likes.length : 0,
                isLiked: Array.isArray(comment.likes)
                  ? comment.likes.includes(userData?.id)
                  : false,
                user: {
                  id: comment.author._id,
                  username: comment.author.username,
                  name: comment.author.name,
                  image: comment.author.profileImage,
                },
              }))}
              content={post.content}
              timestamp={post.createdAt}
              user={{
                id: post.author._id,
                username: post.author.username,
                name: post.author.name,
                image: post.author.profileImage,
              }}
              likes={post.likes.length}
              isLiked={post.isLiked}
              onLike={() => handleLike(post._id)}
              onComment={(content) => handleComment(post._id, content)}
              onEdit={(content) => handleEditPost(post._id, content)}
              onDelete={() => handleDeletePost(post._id)}
              onEditComment={(commentId, content) =>
                handleEditComment(post._id, commentId, content)
              }
              onDeleteComment={(commentId) =>
                handleDeleteComment(post._id, commentId)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
