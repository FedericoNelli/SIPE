import Navbar from "@/components/navbar/navbar"
import Sidenav from "@/components/sidenav/sidenav"


function Dashboard() {
    return (
        <section className="flex align-middle bg-gradient-to-br from-sipe-blue-dark from-40% to-sipe-orange-dark">
            <div>
                <Sidenav />
            </div>
            <div className="w-full">
                <Navbar />
            </div>
        </section>
    )
}

export default Dashboard