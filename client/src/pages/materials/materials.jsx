import Material from "@/components/material/material"
import Navbar from "@/components/navbar/navbar"
import Sidenav from "@/components/sidenav/sidenav"

function Materials() {
    return (
        <section className="min-h-screen flex bg-sipe-gradient">
            <div>
                <Sidenav />
            </div>
            <div className="w-full flex flex-col">
                <Navbar />
                <div className="min-h-fit px-12 py-12 flex flex-col justify-center bg-opacity-500 border border-transparent rounded-xl ">
                    <Material />
                </div>
            </div>
        </section>
    )
}

export default Materials