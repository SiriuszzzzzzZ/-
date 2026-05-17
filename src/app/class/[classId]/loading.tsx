export default function ClassLoading() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Sky section skeleton */}
      <div className="relative overflow-hidden" style={{ height: "35vh" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C2840] via-[#2A3850] to-cream animate-pulse" />
        <div className="absolute bottom-4 inset-x-0 px-6 z-10 text-center">
          <div className="inline-block space-y-2">
            <div className="w-12 h-12 rounded-full bg-white/10 mx-auto animate-pulse" />
            <div className="w-20 h-4 rounded-full bg-white/10 mx-auto animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content area skeletons */}
      <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Pulse bar */}
        <div className="h-6 w-32 rounded-xl bg-warm-100 animate-pulse mx-auto" />

        {/* 3 skeleton cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/30 rounded-3xl p-5 space-y-3" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="h-3 w-20 rounded-full bg-warm-100 animate-pulse" />
            <div className="h-4 w-full rounded-xl bg-warm-100 animate-pulse" />
            <div className="h-4 w-3/4 rounded-xl bg-warm-100 animate-pulse" />
          </div>
        ))}

        <p className="text-center text-xs text-warm-300 animate-pulse">正在收集星光...</p>
      </div>
    </div>
  );
}
