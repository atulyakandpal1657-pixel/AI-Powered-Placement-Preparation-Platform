"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Save, KeyRound, AlertTriangle, User as UserIcon } from "lucide-react";

export default function SettingsPage() {
  const { user, logout, checkAuth } = useAuth();
  const { request: profileRequest, loading: profileLoading } = useApi();
  const { request: passwordRequest, loading: passwordLoading } = useApi();
  const { request: deleteRequest, loading: deleteLoading } = useApi();
  const { showToast } = useToast();

  // Profile Form
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // Password Form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profileRequest({
        url: "/api/auth/me",
        method: "PUT",
        data: { name, avatar }
      });
      await checkAuth();
      showToast("Profile updated successfully", "success");
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to update profile", "error");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    try {
      await passwordRequest({
        url: "/api/auth/password",
        method: "PATCH",
        data: { oldPassword, newPassword }
      });
      showToast("Password updated successfully", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to update password", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    
    try {
      await deleteRequest({
        url: "/api/auth/me",
        method: "DELETE"
      });
      showToast("Account deleted successfully", "success");
      logout();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to delete account", "error");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <section className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-[#6c5ce7]/10 text-[#6c5ce7]">
              <UserIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/50 transition-shadow"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Avatar URL (Optional)</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/50 transition-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-muted cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="flex items-center gap-2 bg-[#6c5ce7] hover:bg-[#5b4dcf] text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold">Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/50 transition-shadow"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/50 transition-shadow"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/50 transition-shadow"
                required
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>

        {/* Danger Zone Section */}
        <section className="bg-danger/5 rounded-2xl border border-danger/20 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-danger/10 text-danger">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-danger">Danger Zone</h2>
          </div>
          <p className="text-muted mb-6">
            Once you delete your account, there is no going back. Please be certain. All your data, solved questions, and notes will be permanently removed.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="flex items-center gap-2 bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20 hover:border-danger px-5 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            {deleteLoading ? "Deleting..." : "Delete Account"}
          </button>
        </section>
      </div>
    </div>
  );
}
