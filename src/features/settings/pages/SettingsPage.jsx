import { useState, useEffect } from "react";
import { fetchMe, updateProfile } from "@/api/authApi";
import { LiquedLoader } from "@/components/loaders";
import toast from "react-hot-toast";

import "../styles/common.css";
import ProfileCard from "../components/ProfileCard";
import ProfileForm from "../components/ProfileForm";
import { baseApi } from "../../../api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetchMe();
        const me = res?.data ?? res;

        if (!alive) return;

        // profile সেট করা
        setProfile({
          profileImage: me?.profileImage,
          coverImage: me?.coverImage,
          name: me?.name,
          email: me?.email,
          username: me?.username,
          followers: me?.followers ? me.followers.length : 0,
          following: me?.following ? me.following.length : 0,
          isOnline: me?.isOnline || false,
        });

        // form values সেট করা
        setFormValues({
          name: me?.name,
          username: me?.username,
          bio: me?.bio,
          phone: me?.phone,
          address: me?.address,
        });
      } catch (e) {
        console.error("Failed to fetch profile:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ======================
  // ProfileForm submit handler
  // ======================
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!formValues) {
      return;
    }

    if (!password.trim()) {
      toast.error("Enter your current password to save changes.");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("username", formValues.username);
      formData.append("bio", formValues.bio);
      formData.append("phone", formValues.phone);
      formData.append("address", formValues.address);

      const res = await updateProfile(formData);
      console.log("Profile updated:", res);

      setProfile((p) => ({
        ...p,
        name: formValues.name,
        username: formValues.username,
      }));

      toast.success("Profile updated successfully.");
      setPassword("");
      setIsPasswordVisible(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      const message = err?.message ?? err?.error ?? "Profile update failed!";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };
  // ======================
  // ProfileImage handler
  // ======================
  const handleProfilePhotoChange = async (file) => {
    setProfile((p) => ({
      ...p,
      profileImage: URL.createObjectURL(file),
    }));

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await updateProfile(formData);
      console.log("Profile photo updated:", res);

      const newProfileUrl = res?.data?.profileImage;
      if (newProfileUrl) {
        setProfile((p) => ({
          ...p,
          profileImage: `${baseApi}${newProfileUrl}`,
        }));
      }

      toast.success("Profile photo updated successfully.");
    } catch (err) {
      console.error("Failed to update profile photo:", err);
      toast.error("Profile photo update failed!");
    }
  };

  // ======================
  // Password input handler
  // ======================
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  if (loading) {
    return (
      <div className="page-loader">
        <LiquedLoader label="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <ProfileCard
        data={profile}
        onChangePhoto={handleProfilePhotoChange}
        showCover={false}
      />

      <div className="settings-form-wrapper mt-24">
        <ProfileForm
          values={formValues ?? {}}
          onChange={(e) =>
            setFormValues((v) => ({ ...v, [e.target.name]: e.target.value }))
          }
          onSubmit={handleProfileSubmit}
          isSubmitting={isSaving}
          passwordValue={password}
          onPasswordChange={handlePasswordChange}
          isPasswordVisible={isPasswordVisible}
          onTogglePasswordVisibility={() =>
            setIsPasswordVisible((prev) => !prev)
          }
        />
      </div>
    </div>
  );
}
