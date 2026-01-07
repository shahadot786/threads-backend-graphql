"use client";

import { useEffect, useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { UPDATE_PROFILE_MUTATION } from "@/graphql/mutations/auth";
import type { User } from "@/types";
import { getDisplayName } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";

export function EditProfileModal() {
  const { user, updateUser } = useAuthStore();
  const { isEditProfileOpen, closeEditProfileModal, showToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    website: "",
    location: "",
    profileImageUrl: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  const [updateProfile, { loading }] = useMutation<{ updateUserProfile: User }>(UPDATE_PROFILE_MUTATION, {
    onCompleted: (data) => {
      updateUser(data.updateUserProfile);
      showToast("Profile updated successfully");
      closeEditProfileModal();
    },
    onError: (error) => {
      showToast(error.message || "Failed to update profile");
    },
  });

  useEffect(() => {
    if (user && isEditProfileOpen) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user, isEditProfileOpen]);

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file");
      return;
    }

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/upload`, {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, profileImageUrl: data.url }));
      showToast("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      variables: {
        input: {
          firstName: formData.firstName,
          lastName: formData.lastName || null,
          username: formData.username,
          bio: formData.bio || null,
          website: formData.website || null,
          location: formData.location || null,
          profileImageUrl: formData.profileImageUrl || null,
        },
      },
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isEditProfileOpen} onOpenChange={(open) => !open && closeEditProfileModal()}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="w-20 h-20 border border-border">
                <AvatarImage src={formData.profileImageUrl} />
                <AvatarFallback>
                  {getDisplayName(formData.firstName, formData.lastName)[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
              </div>
            </div>
            <Button type="button" variant="link" onClick={handleAvatarClick} disabled={isUploading}>
              Change profile photo
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-border py-1 focus:border-foreground outline-none transition-colors"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-border py-1 focus:border-foreground outline-none transition-colors"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-border py-1 focus:border-foreground outline-none transition-colors"
                placeholder="username"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full bg-transparent border-b border-border py-1 focus:border-foreground outline-none transition-colors resize-none"
                placeholder="Write a bio..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Link</label>
              <input
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-border py-1 focus:border-foreground outline-none transition-colors"
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-border py-1 focus:border-foreground outline-none transition-colors"
                placeholder="City, Country"
              />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-xl font-bold h-11" disabled={loading || isUploading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Done
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
