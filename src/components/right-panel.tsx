import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const onlineFriends = [
  {
    id: 1,
    name: "Alice Johnson",
    username: "@alice",
    avatar: "/placeholder-avatar.jpg",
    isOnline: true,
  },
  {
    id: 2,
    name: "Bob Smith",
    username: "@bobsmith",
    avatar: "/placeholder-avatar.jpg",
    isOnline: true,
  },
  {
    id: 3,
    name: "Carol Davis",
    username: "@carol",
    avatar: "/placeholder-avatar.jpg",
    isOnline: true,
  },
  {
    id: 4,
    name: "David Wilson",
    username: "@david",
    avatar: "/placeholder-avatar.jpg",
    isOnline: true,
  },
  {
    id: 5,
    name: "Emma Brown",
    username: "@emma",
    avatar: "/placeholder-avatar.jpg",
    isOnline: true,
  },
];

export function RightPanel() {
  return (
    // <aside className="hidden xl:flex xl:flex-col xl:fixed xl:inset-y-0 xl:right-0  xl:z-40 xl:w-80 xl:pt-16">
    //   <div className="flex flex-col flex-1 bg-background  border-l">
    //     <div className="flex-1 p-4  space-y-6">
    //       {/* Online Friends */}
    //       <Card>
    //         <CardHeader className="pb-3">
    //           <CardTitle className="text-lg">Online Friends</CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-3">
    //           {onlineFriends.map((friend) => (
    //             <div key={friend.id} className="flex items-center space-x-3">
    //               <div className="relative">
    //                 <Avatar className="h-8 w-8">
    //                   <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
    //                   <AvatarFallback className="bg-red-500 text-white text-xs">
    //                     {friend.name
    //                       .split(" ")
    //                       .map((n) => n[0])
    //                       .join("")}
    //                   </AvatarFallback>
    //                 </Avatar>
    //                 {friend.isOnline && (
    //                   <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
    //                 )}
    //               </div>
    //               <div className="flex-1 min-w-0">
    //                 <p className="text-sm font-medium truncate">{friend.name}</p>
    //                 <p className="text-xs text-muted-foreground truncate">{friend.username}</p>
    //               </div>
    //               <Button variant="ghost" size="sm" className="text-xs">
    //                 Chat
    //               </Button>
    //             </div>
    //           ))}
    //           <Button variant="outline" className="w-full mt-3" size="sm">
    //             View All Friends
    //           </Button>
    //         </CardContent>
    //       </Card>
    //     </div>

    //     {/* Footer */}
    //     <div className="border-t  bg-background/95  backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
    //       <div className="space-y-2 text-center">
    //         <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
    //           <a href="#" className="hover:text-red-500 transition-colors">
    //             Privacy
    //           </a>
    //           <a href="#" className="hover:text-red-500 transition-colors">
    //             Terms
    //           </a>
    //           <a href="#" className="hover:text-red-500 transition-colors">
    //             Help
    //           </a>
    //         </div>
    //         <p className="text-xs text-muted-foreground">© 2024 Space. All rights reserved.</p>
    //       </div>
    //     </div>
    //   </div>
    // </aside>
    <></>
  );
}
