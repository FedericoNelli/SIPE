import Navbar from "@/components/Sides/Navbar/Navbar"
import Aside from "@/components/Sides/Aside/Aside"
import Aisle from "@/components/Side/Side"
import { motion } from "framer-motion"

function Sides() {
    return (
        <section className="min-h-screen flex bg-sipe-gradient">
            <div>
                <Aside />
            </div>
            <div className="w-full flex flex-col">
                <Navbar />
                <hr />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <div className="min-h-fit px-12 py-12 flex flex-col justify-center bg-opacity-500 border border-transparent rounded-xl ">
                        <Aisle />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default Sides