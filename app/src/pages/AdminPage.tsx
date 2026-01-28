import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Trash2, RefreshCw } from 'lucide-react';
import { authApi, getApiStatus } from '@/services/api';
import { toast } from 'sonner';

interface AdminPageProps {
  onBack: () => void;
}

export const AdminPage = ({ onBack }: AdminPageProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      // Get API status
      const status = getApiStatus();
      setApiStatus(status);
      
      // Get users from localStorage
      const allUsers = authApi.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
    setIsLoading(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    const allUsers = JSON.parse(localStorage.getItem('pharmastudy_users') || '[]');
    const filtered = allUsers.filter((u: any) => u.id !== userId);
    localStorage.setItem('pharmastudy_users', JSON.stringify(filtered));
    
    toast.success('User deleted');
    loadData();
  };

  const clearAllData = () => {
    if (!confirm('⚠️ WARNING: This will delete ALL data including users, chapters, topics, and items. This cannot be undone!')) return;
    if (!confirm('Are you absolutely sure? Type "yes" to confirm.')) return;
    
    localStorage.removeItem('pharmastudy_users');
    localStorage.removeItem('pharmastudy_chapters');
    localStorage.removeItem('pharmastudy_token');
    
    toast.success('All data cleared');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#0B1E5B] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0B1E5B]">Admin Panel</h1>
          <p className="text-[#6B7280] mt-2">Manage users and system settings</p>
        </div>

        {/* API Status */}
        <div className="bg-white rounded-[22px] border-2 border-[#0B1E5B] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0B1E5B] mb-4">System Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Backend URL:</span>
              <span className="font-mono text-[#0B1E5B]">
                {apiStatus?.apiUrl || 'Not configured (using localStorage)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Backend Connected:</span>
              <span className={apiStatus?.isConfigured ? 'text-green-600' : 'text-amber-600'}>
                {apiStatus?.isConfigured ? '✅ Yes' : '⚠️ No (using localStorage fallback)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Registered Users:</span>
              <span className="font-semibold text-[#0B1E5B]">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Total Chapters:</span>
              <span className="font-semibold text-[#0B1E5B]">{apiStatus?.localChapters || 0}</span>
            </div>
          </div>
          
          {!apiStatus?.isConfigured && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Backend not configured.</strong> The app is using localStorage for data storage.
                To connect to your Railway backend, set the <code>VITE_API_URL</code> environment variable.
              </p>
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white rounded-[22px] border-2 border-[#0B1E5B] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0B1E5B] flex items-center gap-2">
              <Users className="w-5 h-5" />
              Registered Users
            </h2>
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-[#00B8A9] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-[#6B7280]">
              No users registered yet
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-[#0B1E5B]">{user.name}</p>
                    <p className="text-sm text-[#6B7280]">{user.email}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-[22px] border-2 border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-800">Clear All Data</p>
              <p className="text-sm text-red-600">This will delete all users, chapters, topics, and items.</p>
            </div>
            <Button
              onClick={clearAllData}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
