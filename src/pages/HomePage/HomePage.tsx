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
  toggleLikeComment,
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
    isFollowing?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  comments: CommentType[];
  likes: { username: string; _id: string }[];
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
  const fetchPostsWithLikeStatus = async () => {
    const token = context?.userToken || undefined;

    // Use localStorage for follow status since backend /user/{id} doesn't return following list
    const followingData = localStorage.getItem("followingUsers");
    const actualFollowing: string[] = followingData
      ? JSON.parse(followingData)
      : [];

    const response = getPosts(token);
    response().then((data) => {
      const postsWithLikeStatus = data.map((post: any) => {
        const userId = userData?.id;
        const isLiked = userId
          ? post.likes.some((like: any) => like._id === userId)
          : false;

        // Use localStorage following list
        const isFollowing = actualFollowing.includes(post.author._id);

        return {
          ...post,
          isLiked,
          author: {
            ...post.author,
            isFollowing,
          },
        };
      });
      setPosts(postsWithLikeStatus);
    });
  };

  useEffect(() => {
    fetchPostsWithLikeStatus();
  }, [userData?.id]);

  // Refresh posts when window regains focus (e.g., coming back from profile page)
  useEffect(() => {
    const handleFocus = () => {
      fetchPostsWithLikeStatus();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [userData?.id]);

  function handleLike(postId: string) {
    if (!context?.userToken) {
      return;
    }

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

    toggleLikePost(postId, context.userToken)
      .then(() => {})
      .catch(() => {
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
      });
  }

  const handleCreatePost = async (content: string, image?: File) => {
    if (!context?.userToken) {
      return;
    }

    try {
      const newPost = await createPost(content, image, context.userToken);

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
        isLiked: false,
      };

      setPosts((prevPosts) => {
        const updatedPosts = [formattedPost, ...prevPosts];
        return updatedPosts;
      });
    } catch (err: any) {
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

    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));

    deletePost(postId, context.userToken)
      .then(() => {})
      .catch(() => {
        alert("Failed to delete post. Please try again.");
        fetchPostsWithLikeStatus();
      });
  };

  const handleEditPost = (postId: string, newContent: string) => {
    if (!context?.userToken) {
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;
        return {
          ...post,
          content: newContent,
        };
      })
    );

    updatePost(postId, newContent, context.userToken)
      .then(() => {})
      .catch(() => {
        alert("Failed to update post. Please try again.");
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

    deleteComment(commentId, context.userToken)
      .then(() => {})
      .catch(() => {
        alert("Failed to delete comment. Please try again.");
        fetchPostsWithLikeStatus();
      });
  };

  const handleEditComment = (
    postId: string,
    commentId: string,
    newContent: string
  ) => {
    if (!context?.userToken) {
      return;
    }

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

    updateComment(commentId, newContent, context.userToken)
      .then(() => {})
      .catch(() => {
        alert("Failed to update comment. Please try again.");
        fetchPostsWithLikeStatus();
      });
  };

  const handleFollowToggle = async (
    userId: string,
    newIsFollowing: boolean
  ) => {
    if (!context?.userToken) {
      return;
    }

    const followingData = localStorage.getItem("followingUsers");
    const followingUsers = followingData ? JSON.parse(followingData) : [];

    if (newIsFollowing) {
      if (!followingUsers.includes(userId)) {
        followingUsers.push(userId);
        localStorage.setItem("followingUsers", JSON.stringify(followingUsers));
      }
    } else {
      const updated = followingUsers.filter((id: string) => id !== userId);
      localStorage.setItem("followingUsers", JSON.stringify(updated));
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.author._id === userId) {
          return {
            ...post,
            author: {
              ...post.author,
              isFollowing: newIsFollowing,
            },
          };
        }
        return post;
      })
    );
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    if (!context?.userToken) {
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;

        return {
          ...post,
          comments: post.comments.map((comment) => {
            if (comment._id !== commentId) return comment;

            const userId = context?.userData?.id;
            const currentLikes = Array.isArray(comment.likes)
              ? comment.likes
              : [];
            const alreadyLiked = currentLikes.includes(userId!);

            const updatedLikes = alreadyLiked
              ? currentLikes.filter((id) => id !== userId)
              : [...currentLikes, userId!];

            return {
              ...comment,
              likes: updatedLikes,
            };
          }),
        };
      })
    );

    toggleLikeComment(commentId, context.userToken)
      .then(() => {})
      .catch(() => {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id !== postId) return post;

            return {
              ...post,
              comments: post.comments.map((comment) => {
                if (comment._id !== commentId) return comment;

                const userId = context?.userData?.id;
                const currentLikes = Array.isArray(comment.likes)
                  ? comment.likes
                  : [];
                const alreadyLiked = currentLikes.includes(userId!);

                const updatedLikes = alreadyLiked
                  ? currentLikes.filter((id) => id !== userId)
                  : [...currentLikes, userId!];

                return {
                  ...comment,
                  likes: updatedLikes,
                };
              }),
            };
          })
        );
      });
  };

  const handleComment = (postId: string, content: string) => {
    if (!context?.userToken) {
      return;
    }

    const tempId = `temp-${Date.now()}`;

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

    setPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((post) => {
        if (post._id !== postId) return post;
        const updatedPost = {
          ...post,
          comments: [newComment, ...post.comments],
        };
        return updatedPost;
      });
      return updatedPosts;
    });

    addComment(postId, content, context.userToken!)
      .then((response) => {
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
      .catch(() => {
        alert("Failed to save comment. Please try again.");

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
                    isFollowing: post.author.isFollowing || false,
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
                  onLikeComment={(commentId) =>
                    handleLikeComment(post._id, commentId)
                  }
                  onFollowToggle={handleFollowToggle}
                />
              );
            } catch (error) {
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
