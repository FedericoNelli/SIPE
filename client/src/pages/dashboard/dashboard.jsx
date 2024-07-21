import MainDashboard from "@/components/mainDashboard/MainDashboard"
import Navbar from "@/components/navbar/Navbar"
import Aside from "@/components/aside/Aside"

function Dashboard() {
    return (
        <section className="min-h-screen flex bg-sipe-gradient">
            <div>
                <Aside />
            </div>
            <div className="w-full flex flex-col">
                <Navbar />
                <hr />
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                        <MainDashboard />
                    </div>
            </div>
        </section>
    )
}

export default Dashboard
