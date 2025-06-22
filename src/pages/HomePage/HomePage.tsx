"use client"

import React, { useEffect, useState } from "react"
import { Post } from "../../components/Post/Post"
import { getPosts, toggleLikePost } from "@/api/postApi";
import { UserContext } from "@/context/UserContext";
import { getProfile } from "@/api/userApi";



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
    likes: [];
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
const [isLiked, setIsLiked] = useState<boolean>(false);
const { userData, isLoading } = context;
// const [postUserData, setPostUserData] = useState();
  const [posts, setPosts] = useState<PostType[]>([]);
  useEffect(() => {
    const response = getPosts();
    response().then((data) => setPosts(data));
 
    
    // if(posts.map((post)=>{
    //   if (post.likes.includes(userData.id)) {
    //     setIsLiked(true)
    //   }
       
    // })){

    // }
  }, []);


  useEffect(() => {
   
     const liked = posts.some(post =>
        post.likes.includes(userData?.id)
      );
      setIsLiked(liked);
   
    
  }, [posts]);

// useEffect(() => {
//   const response = getProfile(posts);

// }, []);



  // const handleLike = (postId: string) => {
  //   setPosts(
  //     posts.map((post) =>
  //       post.id === postId
  //         ? {
  //             ...post,
  //             isLiked: !post.isLiked,
  //             likes: post.isLiked ? post.likes - 1 : post.likes + 1,
  //           }
  //         : post,
  //     ),
  //   )
  // }

  const handleLike = (postId: string ,token) =>{

    
      toggleLikePost(postId ,token)
      .then(()=> posts.filter((post)=>post._id == postId).map((post)=>post.isLiked=true))
      .catch((err)=>console.log(err))     
    
    


  }

  const handleComment = (postId: string, content: string) => {
    const newComment = {
      id: `c${Date.now()}`,
      user: {
        id: "currentUser",
        name: "You",
        username: "you",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content,
      timestamp: "now",
      likes: 0,
      isLiked: false,
    }

    // setPosts(posts.map((post) => (post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post)))
  }

  // const handleShare = (postId: string) => {
  //   setPosts(posts.map((post) => (post._id  === postId ? { ...post, shares: post.shares + 1 } : post)))
  // }

  // const handleBookmark = (postId: string) => {
  //   setPosts(posts.map((post) => (post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post)))
  // }



    
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-center">Welcome to Space</h1>

        <div className="space-y-6">
          {/* {posts.map((post) => (
            <Post
              key={post.id}
              {...post}
              onLike={() => handleLike(post.id)}
              onComment={(content) => handleComment(post.id, content)}
              onShare={() => handleShare(post.id)}
              onBookmark={() => handleBookmark(post.id)}
              onEdit={() => console.log("Edit post", post.id)}
              onDelete={() => console.log("Delete post", post.id)}
              onReport={() => console.log("Report post", post.id)}
            />
          ))} */}
  
          {posts.map((post) => 
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
              onLike={handleLike(post._id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
