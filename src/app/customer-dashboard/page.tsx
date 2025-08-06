'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check authentication and user role
  useEffect(() => {
    // Ensure we're running on the client side
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      if (!parsedUser || typeof parsedUser !== 'object') {
        setError('Invalid user data. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (parsedUser.role !== 'customer') {
        // If not a customer, redirect to appropriate dashboard
        if (parsedUser.role === 'organizer') {
          router.push('/dashboard');
        } else {
          setError('Access denied.');
        }
        return;
      }

      setUser(parsedUser);
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setError('Error loading user data. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect to login even if localStorage fails
      router.push('/login');
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to Event Hub
              </h1>
              <p className="text-gray-600">Hello, {user?.name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleGoHome}>
                🏠 Home
              </Button>
              <Button variant="outline" onClick={() => router.push('/profile')}>
                Profile
              </Button>
              <Button variant="outline" onClick={() => router.push('/events')}>
                Browse Events
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => router.push('/events')}>
                Browse Events
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/profile')}
              >
                Manage Profile
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/my-tickets')}
              >
                My Tickets
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/customer-dashboard/my-reviews')}
              >
                My Reviews
              </Button>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Profile Summary</h2>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Role:</strong> Customer
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.push('/profile')}
            >
              View Full Profile
            </Button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="text-gray-500 text-center py-8">
              <p>No recent activity</p>
              <p className="text-sm mt-2">
                Start booking events to see your activity here!
              </p>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Rewards & Points</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <p className="text-gray-600 mb-4">Total Points</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/profile')}
              >
                View Rewards
              </Button>
            </div>
          </div>

          {/* Referral Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Refer Friends</h2>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-3">
                Invite friends and earn rewards!
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/profile')}
              >
                Get Referral Code
              </Button>
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Discover Events</h2>
            <div className="text-center text-gray-500">
              <p className="mb-4">Find amazing events happening near you!</p>
              <Button className="w-full" onClick={() => router.push('/events')}>
                Explore Events
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
