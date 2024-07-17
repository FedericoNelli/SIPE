import MainDashboard from "@/components/mainDashboard/mainDashboard"
import Navbar from "@/components/navbar/navbar"
import Sidenav from "@/components/sidenav/sidenav"


function Dashboard() {
    return (
        <section className="flex items-middle bg-sipe-gradient">
            <div>
                <Sidenav />
            </div>
            <div className="w-full">
                <Navbar />
                <hr />
                <div className="flex justify-center content-center py-14">
                    <MainDashboard />
                    <MainDashboard />
                    <MainDashboard />
                    <MainDashboard />
                </div>
            </div>
        </section>
    )
}

export default Dashboard