import MainDashboard from "@/components/mainDashboard/mainDashboard"
import Navbar from "@/components/navbar/navbar"
import Sidenav from "@/components/sidenav/sidenav"

function Dashboard() {
    return (
        <section className="min-h-screen flex bg-sipe-gradient">
            <div>
                <Sidenav />
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
