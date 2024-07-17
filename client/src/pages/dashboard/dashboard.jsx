import MainDashboard from "@/components/mainDashboard/mainDashboard"
import Navbar from "@/components/navbar/navbar"
import Sidenav from "@/components/sidenav/sidenav"


function Dashboard() {
    return (
        <section className="min-h-screen flex items-middle bg-sipe-gradient">
            <div>
                <Sidenav />
            </div>
            <div className="w-full">
                <Navbar />
                <hr />
                <div className="bg-sipe-gradient p-5 md:p-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
                    <MainDashboard />
                </div>
            </div>
        </section>
    )
}

export default Dashboard