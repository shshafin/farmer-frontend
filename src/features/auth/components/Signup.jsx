import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import EyeIcon from "@/assets/IconComponents/Eye";
import EyeOffIcon from "@/assets/IconComponents/EyeOff";
import { registerUser } from "../../../api/authApi";
import toast from "react-hot-toast";

// Initial form state
const initialFormState = {
  name: "",
  username: "",
  phone: "",
  state: "",
  address: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// Reducer for form state
function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialFormState;
    default:
      return state;
  }
}

export default function Register() {
  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const states = [
    "ঢাকা",
    "চট্টগ্রাম",
    "সিলেট",
    "রাজশাহী",
    "খুলনা",
    "বরিশাল",
    "রংপুর",
    "ময়মনসিংহ",
  ];

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "নাম দিতে হবে।";
    if (!formData.username) newErrors.username = "ইউজারনেম দিতে হবে।";
    if (!formData.phone) newErrors.phone = "মোবাইল নম্বর দিতে হবে।";
    if (!formData.state) newErrors.state = "বিভাগ নির্বাচন করুন।";
    if (!formData.address) newErrors.address = "ঠিকানা দিতে হবে।";

    if (!formData.email) newErrors.email = "ইমেল দিতে হবে।";
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email))
      newErrors.email = "সঠিক ইমেল ঠিকানা দিন।";

    if (!formData.password) newErrors.password = "পাসওয়ার্ড দিতে হবে।";
    else if (formData.password.length < 6)
      newErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";

    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "পাসওয়ার্ড মিলছে না।";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    setIsSubmitting(true);
    const res = await registerUser(formData);

    // Success toaster
    toast.success("নিবন্ধন সফল হয়েছে! এখন লগইন করুন।");

    setStatus(res);
    dispatch({ type: "RESET" });
    setErrors({});

    // 2 সেকেন্ড পরে login page redirect
    setTimeout(() => {
      navigate("/auth/login");
    }, 1000);

  } catch (err) {
    console.error(err);
    setErrors({ general: "নিবন্ধন সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।" });
  } finally {
    setIsSubmitting(false);
  }
};

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="signup">
      <div className="title">নিবন্ধন করুন</div>

      <section className="signup-group">
        <section className="left">
          <div className="gap">
            <label htmlFor="name">নাম</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              placeholder="আপনার নাম লিখুন"
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          <div className="gap">
            <label htmlFor="username">ইউজারনেম</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              placeholder="username123"
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>

          <div className="gap">
            <label htmlFor="phone">মোবাইল নম্বর</label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={formData.phone}
              placeholder="+8801XXXXXXXXX"
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.phone && <p className="error">{errors.phone}</p>}
          </div>

          <div className="gap">
            <label htmlFor="state">বিভাগ</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              <option value="">বিভাগ নির্বাচন করুন</option>
              {states.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
            {errors.state && <p className="error">{errors.state}</p>}
          </div>
        </section>

        <section className="right">
          <div className="gap">
            <label htmlFor="address">বর্তমান ঠিকানা</label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              placeholder="বর্তমান ঠিকানা লিখুন"
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.address && <p className="error">{errors.address}</p>}
          </div>

          <div className="gap">
            <label htmlFor="email">ই-মেইল</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              placeholder="example@gmail.com"
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="gap">
            <div className="wrapper">
              <label htmlFor="password">পাসওয়ার্ড</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                placeholder="............"
                onChange={handleChange}
                disabled={isSubmitting}
                required
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
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div className="gap">
            <div className="wrapper">
              <label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                onChange={handleChange}
                onPaste={(e) => {
                  e.preventDefault();
                  alert("পাসওয়ার্ড নিশ্চিত করার জন্য পেস্ট করা যাবে না। অনুগ্রহ করে হাতে লিখুন।");
                }}
                disabled={isSubmitting}
                required
              />
            </div>
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword}</p>
            )}
          </div>
        </section>
      </section>

      {errors.general && (
        <div role="alert" className="error">
          {errors.general}
        </div>
      )}

      <button type="submit" className="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <div className="spinner"></div> নিবন্ধন হচ্ছে...
          </>
        ) : (
          "নিবন্ধন করুন"
        )}
      </button>

      <section className="text-center">
        আপনি কি আগে নিবন্ধন করেছেন?&nbsp;
        <NavLink to="/auth/login" className="nav-link">
          লগইন করুন
        </NavLink>
      </section>
    </form>
  );
}