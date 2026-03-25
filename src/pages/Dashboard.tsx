import AppHeader from "@/components/AppHeader";
import ProgressOverview from "@/components/ProgressOverview";
import GamificationSidebar from "@/components/GamificationSidebar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-6">
        <div className="flex gap-6">
          <ProgressOverview />
          <GamificationSidebar />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
