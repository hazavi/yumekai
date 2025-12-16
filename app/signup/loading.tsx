export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-full max-w-md p-8 bg-white/5 rounded-2xl space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-white/10 rounded-xl animate-pulse" />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="h-8 w-40 bg-white/10 rounded animate-pulse mx-auto" />
          <div className="h-4 w-56 bg-white/10 rounded animate-pulse mx-auto" />
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
        </div>

        {/* Button */}
        <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />

        {/* Link */}
        <div className="h-4 w-48 bg-white/10 rounded animate-pulse mx-auto" />
      </div>
    </div>
  );
}
