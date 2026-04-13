import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Train, Shield, Clock, CreditCard, ChevronRight } from "lucide-react";

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/trains?from=${searchData.from}&to=${searchData.to}&date=${searchData.date}`);
  };

  const features = [
    { icon: Shield, title: "Secure Booking", desc: "100% secure payment gateway" },
    { icon: Clock, title: "Real-time Updates", desc: "Live train status & PNR" },
    { icon: CreditCard, title: "Easy Cancellation", desc: "Hassle-free refunds" },
    { icon: Train, title: "Premium Trains", desc: "Rajdhani, Shatabdi & more" }
  ];

  const popularRoutes = [
    { from: "Mumbai", to: "Delhi", train: "Rajdhani Express", price: "₹2,100" },
    { from: "Delhi", to: "Bhopal", train: "Shatabdi Express", price: "₹1,500" },
    { from: "Delhi", to: "Howrah", train: "Howrah Rajdhani", price: "₹2,400" },
    { from: "Bangalore", to: "Delhi", train: "Karnataka Exp", price: "₹1,800" }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545987796-200677ee1011?w=1200')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 px-8 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
              Book Your Train Journey
              <span className="block text-blue-300">Across India</span>
            </h1>
            <p className="mb-8 text-lg text-blue-100 md:text-xl">
              Experience comfortable travel with premium trains, real-time availability, and instant booking confirmation
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-xl">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-blue-100">From</label>
                  <input
                    type="text"
                    placeholder="Mumbai Central"
                    className="w-full rounded-xl border-0 bg-white/20 px-4 py-3 text-white placeholder-blue-200 focus:bg-white/30 focus:ring-2 focus:ring-blue-400"
                    value={searchData.from}
                    onChange={(e) => setSearchData({...searchData, from: e.target.value})}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-blue-100">To</label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    className="w-full rounded-xl border-0 bg-white/20 px-4 py-3 text-white placeholder-blue-200 focus:bg-white/30 focus:ring-2 focus:ring-blue-400"
                    value={searchData.to}
                    onChange={(e) => setSearchData({...searchData, to: e.target.value})}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-blue-100">Date</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border-0 bg-white/20 px-4 py-3 text-white focus:bg-white/30 focus:ring-2 focus:ring-blue-400"
                    value={searchData.date}
                    onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-orange-600 hover:shadow-xl"
                  >
                    <Search className="h-5 w-5" />
                    Search Trains
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, idx) => (
          <div key={idx} className="group rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Popular Routes */}
      <section>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Popular Routes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {popularRoutes.map((route, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/trains?from=${route.from}&to=${route.to}`)}
              className="cursor-pointer rounded-2xl bg-white p-6 shadow-md transition hover:shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {route.train}
                </span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <span>{route.from}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span>{route.to}</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{route.price}</p>
              <p className="mt-2 text-sm text-gray-500">Starting price</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}