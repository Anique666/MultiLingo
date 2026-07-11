import HomeTree from "../components/HomeTree";
import LeaderboardCard from "../components/LeaderboardCard";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ProtectedRoute from "../components/ProtectedRoute";
import DailyQuestsCard from "../components/DailyQuestsCard";

export default function LearnPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <TopBar />
                <Sidebar />
                <main className="w-full pb-10 pt-24 lg:pl-[16rem]">
                    <div className="mx-auto flex w-full max-w-5xl gap-8 px-4 sm:px-6 lg:px-8 items-start">
                        <div className="min-w-0 flex-1">
                            <HomeTree />
                        </div>
                        <div className="hidden lg:flex w-[300px] shrink-0 flex-col gap-4 pt-4">
                            <LeaderboardCard />
                            <DailyQuestsCard />
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
