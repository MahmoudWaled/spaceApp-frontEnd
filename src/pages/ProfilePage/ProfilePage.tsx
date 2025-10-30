import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit,
  Camera,
  Users,
  UserPlus,
  UserMinus,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Post } from "@/components/Post/Post";
import { CustomDropdown } from "@/components/CustomDropdown";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FollowersFollowing } from "@/components/FollowersFollowing";
import { UserContext } from "@/context/UserContext";
import {
  followUser,
  unfollowUser,
  getUserProfile,
  getUserPosts,
  updateProfile,
  deleteProfileImage,
  updateFullProfile,
} from "@/api/userApi";
import {
  addComment,
  deletePost,
  updatePost,
  deleteComment,
  updateComment,
  toggleLikePost,
} from "@/api/postApi";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as Yup from "yup";
import { useFormik } from "formik";

type EditProfileFormValues = {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  profileImage: File | null;
};

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers: string[];
  following: string[];
  isFollowing?: boolean;
}

interface UserPost {
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
  comments: any[];
  likes: { username: string; _id: string }[];
  isLiked: boolean;
}

function getCroppedImg(imageSrc: string, crop: any): Promise<Blob> {
  // Helper to crop the image and return a Blob
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject();
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject();
      }, "image/jpeg");
    };
    image.onerror = reject;
  });
}

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const context = useContext(UserContext);
  const { userData, userToken } = context || {};

  // Early return if context is not available
  if (!context) {
    console.error("UserContext is not available");
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-4">Please log in to view profiles.</p>
          <Button onClick={() => navigate("/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Confirmation dialogs
  const [deleteImageDialog, setDeleteImageDialog] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Followers/Following modal
  const [showFollowersFollowing, setShowFollowersFollowing] = useState(false);

  // Add state for edit profile dialog
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [, setEditProfileForm] = useState({
    name: profile?.name || "",
    username: profile?.username || "",
    email: profile?.email || "",
    password: "",
    confirmPassword: "",
    profileImage: null as File | null,
    role: "user",
  });

  // State for edit profile errors
  const [editProfileErrors, setEditProfileErrors] = useState<{
    [key: string]: string | string[];
  }>({});

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserPosts();
    }
  }, [userId, userToken]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!userId) {
        throw new Error("No user ID provided");
      }

      const profileData = await getUserProfile(userId, userToken || undefined);

      if (!profileData) {
        throw new Error("No profile data received");
      }

      setProfile(profileData);
      setIsFollowing(profileData.isFollowing || false);
      setIsOwnProfile(userData?.id === userId);

      // Set edit form with current values
      setEditForm({
        name: profileData.name || "",
        username: profileData.username || "",
        bio: profileData.bio || "",
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const postsData = await getUserPosts(userId!, userToken || undefined);

      if (!Array.isArray(postsData)) {
        console.error("Posts data is not an array:", postsData);
        setPosts([]);
        return;
      }

      // Calculate isLiked for each post
      const postsWithLikeStatus = postsData.map((post: any) => {
        const isLiked = userData?.id
          ? post.likes.some((like: any) => like._id === userData.id)
          : false;
        return { ...post, isLiked };
      });

      setPosts(postsWithLikeStatus);
    } catch (error) {
      console.error("Error loading user posts:", error);
      setPosts([]);
    }
  };

  const handleFollowToggle = async () => {
    if (!userToken || !profile) return;

    try {
      if (isFollowing) {
        await unfollowUser(profile._id, userToken);
        setIsFollowing(false);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers: prev.followers.filter((id) => id !== userData?.id),
              }
            : null
        );
      } else {
        await followUser(profile._id, userToken);
        setIsFollowing(true);
        setProfile((prev) =>
          prev
            ? { ...prev, followers: [...prev.followers, userData?.id!] }
            : null
        );
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      // Show user-friendly error message
      if (error.message?.includes("Authentication failed")) {
        alert("Please log in again to continue.");
      } else {
        alert("Failed to follow/unfollow user. Please try again.");
      }
    }
  };

  const handlePostFollowToggle = async (
    userId: string,
    isFollowing: boolean
  ) => {
    if (!userToken) return;

    try {
      if (isFollowing) {
        await unfollowUser(userId, userToken);
      } else {
        await followUser(userId, userToken);
      }

      // Update posts to reflect the follow status change
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.author._id === userId) {
            return {
              ...post,
              author: {
                ...post.author,
                isFollowing: !isFollowing,
              },
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setShowCropDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Profile image update handler (crop confirm)
  const handleCropConfirm = async () => {
    if (!imagePreview || !croppedAreaPixels || !selectedImage) return;
    setIsUpdating(true);
    try {
      const croppedBlob = await getCroppedImg(imagePreview, croppedAreaPixels);
      const croppedFile = new File(
        [croppedBlob],
        selectedImage?.name || "cropped.jpg",
        { type: "image/jpeg" }
      );
      if (!userId || !profile) return;
      // Build FormData with only non-empty fields, only change image
      const formData = new FormData();
      if (profile.name) formData.append("name", profile.name);
      if (profile.username) formData.append("username", profile.username);
      if (profile.email) formData.append("email", profile.email);
      if (profile.bio) formData.append("bio", profile.bio);
      formData.append("role", "user");
      formData.append("profileImage", croppedFile);
      const updatedProfile = await updateFullProfile(userId, formData);
      setProfile(updatedProfile);
      setSelectedImage(null);
      setImagePreview(null);
      setShowCropDialog(false);
    } catch (e) {
      // handle error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userToken || !profile) return;

    try {
      setIsUpdating(true);
      const updateData: any = {};

      if (editForm.name !== profile.name) updateData.name = editForm.name;
      if (editForm.username !== profile.username)
        updateData.username = editForm.username;
      if (editForm.bio !== profile.bio) updateData.bio = editForm.bio;
      if (selectedImage) updateData.avatar = selectedImage;

      if (Object.keys(updateData).length > 0) {
        const updatedProfile = await updateProfile(updateData, userToken);
        setProfile(updatedProfile);
        setSelectedImage(null);
        setImagePreview(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!userToken) return;

    try {
      await deleteProfileImage(userToken);
      setProfile((prev) => (prev ? { ...prev, avatar: undefined } : null));
      setDeleteImageDialog(false);
    } catch (error) {
      console.error("Error deleting profile image:", error);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!userToken) return;
    try {
      await addComment(postId, content, userToken);
      await loadUserPosts(); // reload posts to show new comment
    } catch (error) {
      console.error("Failed to add comment:", error);
      // Optionally, show a user-facing error message here
    }
  };

  const handleLike = async (postId: string) => {
    if (!userToken) return;
    try {
      await toggleLikePost(postId, userToken);
      await loadUserPosts(); // reload posts to update like status
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
    }
  };

  const handleEditPost = async (postId: string, content: string) => {
    if (!userToken) return;
    try {
      await updatePost(postId, content, userToken);
      await loadUserPosts(); // reload posts to show updated content
    } catch (error) {
      console.error("Failed to edit post:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!userToken) return;
    try {
      await deletePost(postId, userToken);
      await loadUserPosts(); // reload posts to remove deleted post
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleEditComment = async (
    _postId: string,
    commentId: string,
    content: string
  ) => {
    if (!userToken) return;
    try {
      await updateComment(commentId, content, userToken);
      await loadUserPosts(); // reload posts to show updated comment
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleDeleteComment = async (_postId: string, commentId: string) => {
    if (!userToken) return;
    try {
      await deleteComment(commentId, userToken);
      await loadUserPosts(); // reload posts to remove deleted comment
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // Edit Profile Button handler
  const handleEditProfileOpen = () => {
    setEditProfileForm({
      name: profile?.name || "",
      username: profile?.username || "",
      email: profile?.email || "",
      password: "",
      confirmPassword: "",
      profileImage: null,
      role: "user",
    });
    setShowEditProfileDialog(true);
  };

  // Fix Formik integration: handleEditProfileSubmit should accept values, not event
  const handleEditProfileSubmit = async (values: EditProfileFormValues) => {
    setEditProfileErrors({});
    const formData = new FormData();
    const { name, username, email, password, confirmPassword, profileImage } =
      values;
    if (name) formData.append("name", name);
    if (username) formData.append("username", username);
    if (email) formData.append("email", email);
    if (password) formData.append("password", password);
    if (confirmPassword) formData.append("confirmPassword", confirmPassword);
    if (profileImage) formData.append("profileImage", profileImage);
    if (!userId || typeof userId !== "string") return;
    try {
      const updated = await updateFullProfile(
        userId,
        formData,
        userToken || undefined
      );
      setProfile(updated);
      if (updated.profileImage) {
        setImagePreview(
          `http://localhost:5000/Uploads/${updated.profileImage}`
        );
      }
      setShowEditProfileDialog(false);
    } catch (err: any) {
      // Robust error parsing
      let errors: { [key: string]: string | string[] } = {};
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors && typeof data.errors === "object") {
          errors = data.errors;
        } else if (typeof data === "string") {
          errors.general = data;
        } else if (Array.isArray(data)) {
          errors.general = data.join(" ");
        } else if (typeof data === "object") {
          if (data.message) {
            errors.general = data.message;
          } else {
            Object.keys(data).forEach((key) => {
              errors[key] = Array.isArray(data[key])
                ? data[key].join(" ")
                : data[key];
            });
          }
        }
      } else {
        errors.general = err.message || "Failed to update profile";
      }
      setEditProfileErrors(errors);
    }
  };

  // Validation schema for edit profile (no required fields)
  const editProfileValidationSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, "minimum length for username is 3 letters")
      .max(15, "maximum length for username is 15 letters"),
    name: Yup.string()
      .min(3, "minimum length for name is 3 letters")
      .max(30, "maximum length for name is 30 letters"),
    email: Yup.string().email("please enter valid email"),
    password: Yup.string().matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
      "password must be with minimum 8 characters, at least one upper case English letter, one lower case English letter, one number and one special character"
    ),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("password")],
      "passwords must match"
    ),
    profileImage: Yup.mixed().nullable(),
  });

  const formik = useFormik<EditProfileFormValues>({
    initialValues: {
      username: profile?.username || "",
      name: profile?.name || "",
      email: profile?.email || "",
      password: "",
      confirmPassword: "",
      profileImage: null,
    },
    enableReinitialize: true,
    validationSchema: editProfileValidationSchema,
    onSubmit: handleEditProfileSubmit,
  });

  if (!userId) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid User ID
          </h1>
          <p className="text-gray-600 mb-4">No user ID provided in the URL.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Profile
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>User ID: {userId}</p>
            <p>Token: {userToken ? "Present" : "Missing"}</p>
          </div>
          <Button
            onClick={() => {
              setError(null);
              loadProfile();
            }}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">User not found</h1>
          <p className="text-gray-500 mt-2">
            The user you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    imagePreview ||
                    (profile.avatar
                      ? `http://localhost:5000/Uploads/${profile.avatar}`
                      : "/placeholder-avatar.jpg")
                  }
                  alt={profile.name}
                />
                <AvatarFallback className="bg-red-500 text-white text-2xl">
                  {profile.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>

              {isOwnProfile && (
                <div className="absolute -bottom-2 -right-2">
                  <CustomDropdown
                    triggerClassName="h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
                    items={[
                      {
                        label: "Change Photo",
                        onClick: () =>
                          document.getElementById("avatar-upload")?.click(),
                      },
                      {
                        label: "Remove Photo",
                        onClick: () => setDeleteImageDialog(true),
                        className: "text-red-600",
                      },
                    ]}
                  >
                    <Camera className="h-4 w-4" />
                  </CustomDropdown>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <Input
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isUpdating}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedImage(null);
                        setImagePreview(null);
                        setEditForm({
                          name: profile.name || "",
                          username: profile.username || "",
                          bio: profile.bio || "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <span className="text-gray-500">@{profile.username}</span>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditProfileOpen}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </Button>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-gray-600 mb-4">{profile.bio}</p>
                  )}

                  <div className="flex items-center space-x-6 mb-4">
                    <div
                      className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-colors"
                      onClick={() => setShowFollowersFollowing(true)}
                    >
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {profile.followers.length} followers
                      </span>
                    </div>
                    <div
                      className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-colors"
                      onClick={() => setShowFollowersFollowing(true)}
                    >
                      <UserPlus className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {profile.following.length} following
                      </span>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollowToggle}
                      className={
                        isFollowing
                          ? "bg-gray-500 hover:bg-gray-600"
                          : "bg-red-500 hover:bg-red-600"
                      }
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Posts */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Posts</h2>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No posts yet</p>
              <p className="text-sm text-gray-400 mt-2">
                This user hasn't created any posts.
              </p>
            </CardContent>
          </Card>
        ) : (
          posts
            .map((post) => {
              // Skip posts with missing required data
              if (!post || !post._id || !post.author) {
                console.warn("Skipping post with missing data:", post);
                return null;
              }

              return (
                <Post
                  key={post._id}
                  id={post._id}
                  images={post.image ? [post.image] : []}
                  comments={(post.comments || []).map((comment: any) => ({
                    id: comment._id || "",
                    content: comment.text || "",
                    timestamp: comment.createdAt || "",
                    likes: Array.isArray(comment.likes)
                      ? comment.likes.length
                      : 0,
                    isLiked: Array.isArray(comment.likes)
                      ? comment.likes.includes(userData?.id)
                      : false,
                    user: {
                      id: comment.author?._id || "",
                      username: comment.author?.username || "",
                      name: comment.author?.name || "",
                      image: comment.author?.profileImage || "",
                    },
                  }))}
                  content={post.content || ""}
                  timestamp={post.createdAt || ""}
                  user={{
                    id: post.author._id || "",
                    username: post.author.username || "",
                    name: post.author.name || "",
                    image: post.author.profileImage || "",
                    isFollowing: post.author.isFollowing || false,
                  }}
                  likes={Array.isArray(post.likes) ? post.likes.length : 0}
                  isLiked={post.isLiked || false}
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
                  onFollowToggle={handlePostFollowToggle}
                />
              );
            })
            .filter(Boolean)
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={deleteImageDialog}
        onClose={() => setDeleteImageDialog(false)}
        onConfirm={handleDeleteImage}
        title="Delete Profile Image"
        description="Are you sure you want to delete your profile image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Profile Image</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-72 bg-gray-200">
            {imagePreview && (
              <Cropper
                image={imagePreview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <label className="flex-1">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCropDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showEditProfileDialog}
        onOpenChange={setShowEditProfileDialog}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <Input
              placeholder="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.name}
              </div>
            )}
            <Input
              placeholder="Username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.username && formik.errors.username && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.username}
              </div>
            )}
            <Input
              placeholder="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.email}
              </div>
            )}
            <Input
              placeholder="Password"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </div>
            )}
            <Input
              placeholder="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.confirmPassword}
                </div>
              )}
            <Input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={(e) =>
                formik.setFieldValue(
                  "profileImage",
                  e.currentTarget.files?.[0] || null
                )
              }
            />
            {formik.touched.profileImage && formik.errors.profileImage && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.profileImage}
              </div>
            )}
            {/* Show API/general errors if present */}
            {editProfileErrors.general && (
              <div className="text-red-500 text-sm mt-2 text-center">
                {Array.isArray(editProfileErrors.general)
                  ? editProfileErrors.general.join(" ")
                  : editProfileErrors.general}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Followers/Following Modal */}
      <FollowersFollowing
        userId={userId || ""}
        isOpen={showFollowersFollowing}
        onClose={() => setShowFollowersFollowing(false)}
      />
    </div>
  );
}
