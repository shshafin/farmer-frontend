import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EyeIcon from "@/assets/IconComponents/Eye";
import EyeOffIcon from "@/assets/IconComponents/EyeOff";
import { loginUser } from "../../../api/authApi"; // তোমার API ফাইল থেকে

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation function
  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "ইউজারনেম বা ই-মেইল দিতে হবে।";
    }

    if (!formData.password.trim()) {
      newErrors.password = "পাসওয়ার্ড দিতে হবে।";
    } else if (formData.password.length < 6) {
      newErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await loginUser(formData); // API call
      
      if (res?.data?.accessToken) {
        // Save token in localStorage
        localStorage.setItem("accessToken", res.data.accessToken);
      }

      if (res?.success) {
        toast.success("সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...");
        setTimeout(() => navigate("/"), 1500); // 1.5 সেকেন্ড পরে redirect
      } else {
        // API থেকে error message
        const msg = res?.message || "ইউজারনেম বা পাসওয়ার্ড ভুল।";
        toast.error(msg);
        setErrors({ general: msg });
      }
    } catch (err) {
      console.error(err);
      toast.error("লগইন সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।");
      setErrors({ general: "লগইন সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (<>
  <div className="title" style={{color: 'white'}}>কৃষক এরিয়া</div>

    <form onSubmit={handleSubmit} noValidate className="login">
      <div className="title">লগইন করুন</div>

      <div className="gap">
        <input
          type="text"
          name="email"
          value={formData.email}
          placeholder="ই-মেইল"
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>

      <div className="gap">
        <div className="wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            placeholder="পাসওয়ার্ড"
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="showHide"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? <EyeIcon width={20} /> : <EyeOffIcon width={20} />}
          </button>
        </div>
        {errors.password && <div className="error">{errors.password}</div>}
      </div>

      {errors.general && <div className="error">{errors.general}</div>}

      <button type="submit" className="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <div className="spinner"></div> লগইন হচ্ছে...
          </>
        ) : (
          "লগইন করুন"
        )}
      </button>

      <section className="text-center">
        আপনি কি নিবন্ধন করেন নি?&nbsp;
        <NavLink to="/auth/signup" className="nav-link">
          নিবন্ধন করুন
        </NavLink>
      </section>
    </form>
  </>);
}