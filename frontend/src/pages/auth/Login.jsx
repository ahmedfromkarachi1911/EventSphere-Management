import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, LogIn } from "lucide-react";

import { loginUser } from "../../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const data = await loginUser(formData);
      console.log("LOGIN RESPONSE:", data);

      if (!data.token || !data.user) {
        setMessage(data.message || "Login failed");
        return;
      }

      const validRoles = ["admin", "exhibitor", "attendee"];

      if (!validRoles.includes(data.user.role)) {
        setMessage("Invalid user role");
        return;
      }

      // Remove previous login data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Save fresh login data
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      if (data.user.role === "admin") {
        navigate("/admin/dashboard", {
          replace: true,
        });
        return;
      }

      if (data.user.role === "exhibitor") {
        navigate("/exhibitor/dashboard", {
          replace: true,
        });
        return;
      }

      if (data.user.role === "attendee") {
        navigate("/attendee/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-blue-700 to-blue-500 p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Sparkles size={20} />
          </span>

          EventSphere
        </div>

        <div className="max-w-lg">
          <h2 className="text-4xl font-bold">
            Welcome Back!
          </h2>

          <p className="mt-5 text-lg leading-8 text-blue-100">
            Login to continue managing and exploring
            expos on EventSphere.
          </p>

          <img
            src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=700&q=80"
            alt="EventSphere"
            className="mt-10 w-full rounded-2xl object-cover opacity-90"
          />
        </div>

        <p className="text-sm text-blue-100">
          EventSphere Management
        </p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Login to your account
          </h1>

          <p className="mt-2 text-slate-500">
            Enter your details to access your dashboard
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" />
                Remember Me
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </Link>
            </div>

            {message && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <LogIn size={18} />

              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}