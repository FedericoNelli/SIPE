import Material from "@/components/Material/Material"
import Navbar from "@/components/Navbar/Navbar"
import Aside from "@/components/Aside/Aside"

function Materials() {
    return (
        <section className="min-h-screen flex bg-sipe-gradient">
            <div>
                <Aside />
            </div>
            <div className="w-full flex flex-col">
                <Navbar />
                <hr />
                <div className="min-h-fit px-12 py-12 flex flex-col justify-center bg-opacity-500 border border-transparent rounded-xl ">
                    <Material />
                </div>
            </div>
        </section>
    )
}

export default Materials