import HomeTree from "../components/HomeTree";
import LeaderboardCard from "../components/LeaderboardCard";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ProtectedRoute from "../components/ProtectedRoute";

export default function LearnPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-surface-alt">
                <TopBar />
                <main className="w-full pb-10 pt-24">
                    <div className="grid w-full gap-8 px-0 lg:grid-cols-[18rem_minmax(0,1fr)_20rem] lg:items-start">
                        <div className="hidden lg:block lg:pl-0">
                            <Sidebar />
                        </div>

                        <div className="min-w-0 px-4 sm:px-6 lg:px-0">
                            <HomeTree />
                        </div>

                        <div className="hidden lg:block lg:pr-0">
                            <LeaderboardCard />
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
