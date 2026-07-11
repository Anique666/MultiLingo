import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import CompactLeaderboard from "../components/CompactLeaderboard";
import SectionsList from "../components/SectionsList";
import ProtectedRoute from "../components/ProtectedRoute";
import DailyQuestsCard from "../components/DailyQuestsCard";

export default function SectionsPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white">
                <TopBar />
                <Sidebar />
                <main className="w-full pb-10 pt-24 lg:pl-[16rem]">
                    <div className="mx-auto flex w-full max-w-5xl gap-8 px-4 sm:px-6 lg:px-8 items-start">
                        <div className="min-w-0 flex-1">
                            <SectionsList />
                        </div>
                        <div className="hidden lg:flex w-[300px] shrink-0 flex-col gap-4 pt-4">
                            <CompactLeaderboard />
                            <DailyQuestsCard />
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
