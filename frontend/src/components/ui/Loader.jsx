export const Loader = ({ label = "Loading", size = "md" }) => {
  const sizeClass =
    size === "lg" ? "h-14 w-14 border-[5px]" : size === "sm" ? "h-6 w-6 border-2" : "h-10 w-10 border-4";

  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div className={`${sizeClass} animate-spin rounded-full border-brand-blue/20 border-t-brand-blue`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
};
