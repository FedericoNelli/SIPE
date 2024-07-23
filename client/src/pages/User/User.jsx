import Navbar from "@/components/Navbar/Navbar"
import Aside from "@/components/Aside/Aside"
import AddUser from "@/components/AddUser/AddUser"

function User() {
    return (
        <section className="min-h-screen flex bg-sipe-gradient">
            <div>
                <Aside />
            </div>
            <div className="w-full flex flex-col">
                <Navbar />
                <hr />
                <div className="min-h-fit px-12 py-12 flex flex-col justify-center bg-opacity-500 border border-transparent rounded-xl ">
                    <AddUser />
                </div>
            </div>
        </section>
    )
}

export default User