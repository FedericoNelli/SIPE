import Navbar from "@/components/Navbar/Navbar"
import Aside from "@/components/Aside/Aside"
import Shelf from "@/components/Shelf/Shelf"
import { motion } from "framer-motion"

function Shelves() {
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
                        <Shelf />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default Shelves