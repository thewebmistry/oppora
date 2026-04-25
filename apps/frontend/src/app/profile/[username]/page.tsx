'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { Button, Card, PageLoader } from '@/components/ui';
import { CheckCircle, MapPin, Mail, Calendar } from 'lucide-react';
import apiClient from '@/lib/api';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState<boolean>(false);

  // Helper to check authentication
  const checkAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Login required');
      router.push('/login');
      return false;
    }
    return true;
  };

  const handleFollowClick = async () => {
    if (!checkAuth()) return;
    if (!userProfile) return;

    setIsLoadingFollow(true);
    const previousIsFollowing = isFollowing;
    const previousFollowerCount = userProfile.totalFollowers || 0;

    // Optimistic update
    setIsFollowing(!previousIsFollowing);
    setUserProfile(prev => prev ? {
      ...prev,
      totalFollowers: previousIsFollowing ? previousFollowerCount - 1 : previousFollowerCount + 1
    } : prev);

    try {
      await apiClient.patch(`/users/${userProfile._id}/follow`);
      // Success - state already updated
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Revert optimistic update
      setIsFollowing(previousIsFollowing);
      setUserProfile(prev => prev ? {
        ...prev,
        totalFollowers: previousFollowerCount
      } : prev);
      alert('Failed to update follow status. Please try again.');
    } finally {
      setIsLoadingFollow(false);
    }
  };

  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setUsername(resolved.username);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!username) return;

    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/v1/users/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found');
            return;
          }
          throw new Error(`Failed to fetch user: ${response.statusText}`);
        }

        const data = await response.json();
        setUserProfile(data.data);

        // Fetch follow status if user is authenticated
        const token = localStorage.getItem('token');
        if (token && data.data?._id) {
          try {
            const followStatusRes = await apiClient.get(`/users/${data.data._id}/follow-status`);
            // Response shape: { success: true, data: { isFollowing: boolean, targetUserId: string } }
            setIsFollowing(followStatusRes.data.data?.isFollowing ?? false);
          } catch (err) {
            console.error('Error fetching follow status:', err);
            // Silently fail - follow status defaults to false
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (isLoading) {
    return <PageLoader message="Loading profile..." />;
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="text-red-500 text-5xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {error === 'User not found' ? 'User Not Found' : 'Error Loading Profile'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error === 'User not found' 
              ? `The user "${username}" doesn't exist or may have been removed.`
              : error || 'Unable to load user profile at this time.'
            }
          </p>
          <Button 
            variant="primary" 
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const displayName = `${userProfile.firstName} ${userProfile.lastName}`;
  const joinDate = new Date(userProfile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <Card className="mb-8" padding="xl" shadow border>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {userProfile.avatarUrl ? (
                    <img 
                      src={userProfile.avatarUrl} 
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-gray-700 dark:text-gray-300">
                      {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              {userProfile.isVerified && (
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                  <CheckCircle size={20} />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {displayName}
                </h1>
                {userProfile.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
                    <CheckCircle size={14} />
                    Verified
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                @{userProfile.username}
              </p>

              {userProfile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                  {userProfile.bio.length > 150 
                    ? `${userProfile.bio.substring(0, 150)}...` 
                    : userProfile.bio
                  }
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-6">
                {userProfile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <span>{userProfile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail size={18} />
                  <span>{userProfile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>Joined {joinDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  variant={isFollowing ? 'danger' : 'primary'}
                  size="lg"
                  onClick={handleFollowClick}
                  disabled={isLoadingFollow}
                  isLoading={isLoadingFollow}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
                <Button variant="outline" size="lg">
                  Send Message
                </Button>
                <Button variant="secondary" size="lg">
                  More Options
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6" shadow border hoverEffect>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {userProfile.totalPosts || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">
              Total Posts
            </div>
          </Card>
          
          <Card className="text-center p-6" shadow border hoverEffect>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {userProfile.totalFollowers || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">
              Followers
            </div>
          </Card>
          
          <Card className="text-center p-6" shadow border hoverEffect>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {userProfile.totalFollowing || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">
              Following
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex space-x-8">
            {['Activity', 'About', 'Friends'].map((tab) => (
              <button
                key={tab}
                className="py-4 px-1 text-lg font-medium border-b-2 border-transparent hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Placeholder */}
        <Card className="p-8 text-center" shadow border>
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            Select a tab to view {userProfile.firstName}'s content
          </div>
          <p className="text-gray-400 dark:text-gray-500 mt-2">
            This section will be implemented in future updates
          </p>
        </Card>
      </div>
    </div>
  );
}