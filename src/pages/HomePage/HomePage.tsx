import React, { useEffect, useState } from "react";
import { Post } from "../../components/Post/Post";
import { CreatePost } from "../../components/CreatePost";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  getPosts,
  toggleLikePost,
  addComment,
  deletePost,
  updatePost,
  deleteComment,
  updateComment,
  createPost,
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
  const [deletePostDialog, setDeletePostDialog] = useState<{
    isOpen: boolean;
    postId: string | null;
  }>({ isOpen: false, postId: null });
  const [deleteCommentDialog, setDeleteCommentDialog] = useState<{
    isOpen: boolean;
    postId: string | null;
    commentId: string | null;
  }>({ isOpen: false, postId: null, commentId: null });

  // Helper function to fetch posts with like status
  const fetchPostsWithLikeStatus = () => {
    const response = getPosts();
    response().then((data) => {
      const postsWithLikeStatus = data.map((post: any) => {
        const userId = userData?.id;
        const isLiked = userId
          ? post.likes.some((like: any) => like._id === userId)
          : false;
        return { ...post, isLiked };
      });
      setPosts(postsWithLikeStatus);
    });
  };

  useEffect(() => {
    fetchPostsWithLikeStatus();
  }, [userData?.id]);

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

        const updatedPost = {
          ...post,
          likes: updatedLikes,
          isLiked: !alreadyLiked,
        };

        return updatedPost;
      })
    );

    // Then make the API call
    toggleLikePost(postId, context.userToken)
      .then(() => {
        // API call successful, no need to update state again
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

  const handleCreatePost = async (content: string, image?: File) => {
    if (!context?.userToken) {
      console.error("User not authenticated");
      return;
    }

    try {
      const newPost = await createPost(content, image, context.userToken);

      // Ensure the new post has the correct structure
      const formattedPost: PostType = {
        _id: newPost._id,
        content: newPost.content,
        image: newPost.image || null,
        author: {
          _id: newPost.author._id,
          username: newPost.author.username,
          name: newPost.author.name,
          profileImage: newPost.author.profileImage || "",
        },
        createdAt: newPost.createdAt,
        updatedAt: newPost.updatedAt || newPost.createdAt,
        comments: newPost.comments || [],
        likes: newPost.likes || [],
        isLiked: false, // New posts are not liked by the author
      };

      // Add the new post to the beginning of the list
      setPosts((prevPosts) => {
        const updatedPosts = [formattedPost, ...prevPosts];
        return updatedPosts;
      });
    } catch (err: any) {
      console.error("Error creating post:", err);
      console.error("Error details:", err.response?.data || err.message);

      // If there's an error, refresh the posts to ensure consistency
      fetchPostsWithLikeStatus();

      alert("Failed to create post. Please try again.");
    }
  };

  const handleDeletePost = (postId: string) => {
    setDeletePostDialog({ isOpen: true, postId });
  };

  const confirmDeletePost = () => {
    if (!deletePostDialog.postId || !context?.userToken) return;

    const postId = deletePostDialog.postId;

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
        fetchPostsWithLikeStatus();
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
        fetchPostsWithLikeStatus();
      });
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setDeleteCommentDialog({ isOpen: true, postId, commentId });
  };

  const confirmDeleteComment = () => {
    if (
      !deleteCommentDialog.postId ||
      !deleteCommentDialog.commentId ||
      !context?.userToken
    )
      return;

    const { postId, commentId } = deleteCommentDialog;

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
        fetchPostsWithLikeStatus();
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
        fetchPostsWithLikeStatus();
      });
  };

  const handleComment = (postId: string, content: string) => {
    if (!context?.userToken) {
      console.error("User not authenticated");
      return;
    }

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

    // Add the comment optimistically at the top
    setPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((post) => {
        if (post._id !== postId) return post;
        const updatedPost = {
          ...post,
          comments: [newComment, ...post.comments], // Add to top
        };
        return updatedPost;
      });
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
                  comment._id === tempId
                    ? {
                        _id: response._id,
                        text: response.text,
                        createdAt: response.createdAt,
                        likes: response.likes || [],
                        author: {
                          _id:
                            response.author?._id || context.userData?.id || "",
                          username:
                            response.author?.username ||
                            context.userData?.username ||
                            "",
                          name:
                            response.author?.name ||
                            context.userData?.name ||
                            "",
                          profileImage:
                            response.author?.profileImage ||
                            context.userData?.avatar ||
                            "",
                        },
                      }
                    : comment
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
    <div className="container mx-auto py-8 max-w-2xl overflow-x-hidden">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-center">Welcome to Space</h1>

        {/* Create Post Section */}
        <CreatePost onSubmit={handleCreatePost} />

        <div className="space-y-6">
          {posts?.map((post) => {
            try {
              return (
                <Post
                  key={post._id}
                  id={post._id}
                  images={post.image ? [post.image] : []}
                  comments={post.comments.map((comment: any) => ({
                    id: comment._id,
                    content: comment.text,
                    timestamp: comment.createdAt,
                    likes: Array.isArray(comment.likes)
                      ? comment.likes.length
                      : 0,
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
                  currentUserId={userData?.id}
                  onEditComment={(commentId, content) =>
                    handleEditComment(post._id, commentId, content)
                  }
                  onDeleteComment={(commentId) =>
                    handleDeleteComment(post._id, commentId)
                  }
                />
              );
            } catch (error) {
              console.error("Error rendering post:", post._id, error);
              return (
                <div
                  key={post._id}
                  className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20"
                >
                  <p className="text-red-600">
                    Error rendering post. Please refresh the page.
                  </p>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={deletePostDialog.isOpen}
        onClose={() => setDeletePostDialog({ isOpen: false, postId: null })}
        onConfirm={confirmDeletePost}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={deleteCommentDialog.isOpen}
        onClose={() =>
          setDeleteCommentDialog({
            isOpen: false,
            postId: null,
            commentId: null,
          })
        }
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
