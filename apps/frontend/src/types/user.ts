export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'owner';
  avatarUrl?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedIn?: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Statistics for profile page
  totalPosts?: number;
  totalFollowers?: number;
  totalFollowing?: number;
  location?: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: User;
  message?: string;
}