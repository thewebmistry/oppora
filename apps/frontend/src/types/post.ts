export interface IPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  mediaUrl?: string;
  tags: string[];
  likes: string[]; // array of user IDs who liked
  commentsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// For API response
export interface PostsResponse {
  success: boolean;
  data: IPost[];
  message?: string;
}