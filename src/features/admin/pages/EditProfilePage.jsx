import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { fetchMe, updateProfile } from "@/api/authApi";

export default function EditProfilePage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetchMe();
        if (res?.success && res.data) {
          setForm({
            name: res.data.name || "",
            username: res.data.username || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            address: res.data.address || "",
          });
        } else {
          toast.error("Failed to fetch profile data");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      );
      const res = await updateProfile(formData);
      if (res?.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-5 text-center text-muted">Loading profile...</div>;
  }

  return (
    <div
      className="content-wrapper _scoped_admin"
      style={{ minHeight: "839px" }}>
      <Toaster position="top-right" />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Edit Profile</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item active">Edit Profile</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-lg-8">
                <div className="card card-primary card-outline mb-3">
                  <div className="card-header">
                    <h3 className="card-title mb-0">Account Details</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="name">Full Name</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          className="form-control"
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label htmlFor="username">Username</label>
                        <input
                          id="username"
                          name="username"
                          type="text"
                          className="form-control"
                          value={form.username}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <textarea
                        id="address"
                        name="address"
                        className="form-control"
                        rows={3}
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="card card-outline card-info mb-3">
                  <div className="card-header">
                    <h3 className="card-title mb-0">Contact Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="email">Email Address</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          className="form-control"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          className="form-control"
                          value={form.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card card-outline card-light">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    {saving && (
                      <span className="text-success small font-weight-bold">
                        Saving...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
