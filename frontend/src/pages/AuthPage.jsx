import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Train, Eye, EyeOff, Mail, Lock, User, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { name: formData.name, email: formData.email, password: formData.password };

      if (isLogin) {
        await login({ email: payload.email, password: payload.password });
      } else {
        await register(payload);
      }

      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Luxury Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500"></div>
          
          {/* Header with Luxury Feel */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="relative inline-flex items-center justify-center gap-2 mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-br from-amber-500 to-rose-500 p-3 rounded-2xl shadow-lg">
                <Train className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {isLogin ? "Welcome Back" : "Join the Journey"}
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              {isLogin ? "Access your premium travel experience" : "Start your luxury railway experience"}
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 group overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider with Or */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">or</span>
              </div>
            </div>

            {/* Social Login Option */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Continue with Google
              </span>
            </button>

            {/* Toggle between Login & Signup */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ name: "", email: "", password: "" });
                  }}
                  className="ml-2 text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-400 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};