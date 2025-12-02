import React, { useState } from "react";
import { Car, User, Building, Truck, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login, loginWithGoogle, register, resetPassword, apiLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "personal" as "personal" | "fleet_owner" | "driver",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await resetPassword(formData.email);
      setSuccess("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(
          formData.email,
          formData.password,
          formData.name,
          formData.role
        );
        setSuccess("Registration successful! You are now logged in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");

    try {
      await loginWithGoogle(formData.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google Sign-In failed");
    }
  };

  const demoCredentials = [
    { email: "owner@fleet.com", role: "Fleet Owner", icon: Building },
    { email: "driver@fleet.com", role: "Driver", icon: Truck },
    { email: "personal@user.com", role: "Personal User", icon: User },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #4C1D95, #5B21B6, #6D28D9, #7C3AED)",
      }}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/20 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border border-white/30"
        >
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-white/20 p-4 rounded-2xl shadow-lg backdrop-blur-lg">
              <Car className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
              Vehicle<span className="text-yellow-300">Tracker</span>
            </h1>
          </div>

          <h2 className="text-3xl font-semibold text-white mb-4">
            Smart Fleet & Vehicle Management
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Manage vehicles with tracking, analytics, reminders and more.
          </p>

          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border p-6">
            <h3 className="text-white text-lg font-semibold mb-4">
              Try Demo Accounts
            </h3>

            <div className="space-y-3">
              {demoCredentials.map((cred, i) => {
                const Icon = cred.icon;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        email: cred.email,
                        password: "demo",
                      });
                      setIsLogin(true);
                      setShowForgotPassword(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/20 hover:bg-white/30 text-white border"
                  >
                    <Icon className="h-6 w-6 text-yellow-200" />
                    <div>
                      <p className="font-semibold">{cred.role}</p>
                      <p className="text-white/80 text-sm">{cred.email}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* RIGHT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showForgotPassword ? "forgot" : (isLogin ? "login" : "signup")}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800">
                {showForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Create Account")}
              </h3>
              <p className="text-gray-500">
                {showForgotPassword
                  ? "Enter your email to receive reset instructions"
                  : (isLogin ? "Sign in to continue" : "Create a new account")}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700">
                {success}
              </div>
            )}

            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                    }}
                    className="w-full px-4 py-3 rounded-xl border"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={apiLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                             text-white rounded-xl font-semibold shadow-lg hover:opacity-90 
                             transition-all disabled:opacity-50"
                >
                  {apiLoading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-purple-600 font-medium hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NAME */}
                {!isLogin && (
                  <div>
                    <label className="block text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border"
                      placeholder="John Doe"
                    />
                  </div>
                )}

                {/* EMAIL */}
                <div>
                  <label className="block text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                    }}
                    className="w-full px-4 py-3 rounded-xl border"
                    placeholder="you@example.com"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border"
                      placeholder="••••••••"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3 text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {isLogin && (
                    <div className="text-right mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setError("");
                          setSuccess("");
                        }}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {/* ROLE */}
                {!isLogin && (
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Account Type
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border"
                    >
                      <option value="personal">Personal User</option>
                      <option value="fleet_owner">Fleet Owner</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>
                )}

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={apiLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                           text-white rounded-xl font-semibold shadow-lg hover:opacity-90 
                           transition-all disabled:opacity-50"
                >
                  {apiLoading
                    ? "Please wait..."
                    : isLogin
                      ? "Sign In"
                      : "Create Account"}
                </button>
              </form>
            )}

            {!showForgotPassword && (
              <>
                {/* OR DIVIDER */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* GOOGLE SIGN-IN */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={apiLoading}
                  className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl font-semibold 
                             hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center 
                             justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </button>

                {/* SWITCH */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-purple-700 font-semibold hover:underline"
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already registered? Sign in"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
