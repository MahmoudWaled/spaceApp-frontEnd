
import React, { useEffect, useState } from "react"
import { Post } from "../../components/Post/Post"
import { getPosts, toggleLikePost } from "@/api/postApi";
import { UserContext } from "@/context/UserContext";



type PostType = {
    _id: string;
    content: string;
    image: string | null;
    author: {
      _id: string;
      username: string;
      name: string;
      profileImage:string;
    };
    createdAt: string;
    updatedAt: string;
    comments: [];
    likes: {username: string , _id:string}[];
    isLiked:boolean;
  };
type PostUser= {
  id: string
  name: string
  username: string
  profileImage?: string
}
  type PostComment = {
  id: string
  user: PostUser
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
}



export function HomePage() {





  const context = React.useContext(UserContext);
  if (!context) throw new Error("UserContext missing");
  const { userData } = context;
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const response = getPosts();
    response().then((data) => setPosts(data));
  }, []);





function handleLike(postId: string) {
  toggleLikePost(postId, context?.userToken)
    .then(() => {
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
    })
    .catch((err) => console.log(err));
}

  const handleComment = (postId: string, content: string) => {};

    
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-center">Welcome to Space</h1>

        <div className="space-y-6">
          {posts?.map((post) => 
            <Post
              key={post._id}
              id={post._id}
              images={post.image ? [post.image] : []}
              comments={post.comments.map((comment: any) => ({
                id: comment._id,
                content: comment.text,
                timestamp: comment.createdAt,
                likes: comment.likes?.length || 0,
                isLiked: comment.likes?.includes(userData?.id) || false,
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
              onLike={()=>handleLike(post._id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
