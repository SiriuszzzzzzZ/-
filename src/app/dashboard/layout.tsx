import { DashNav } from "./DashNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream pb-20">
      {children}
      <DashNav />
    </div>
  );
}
