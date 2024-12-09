import MainDashboard from "@/components/MainDashboard/MainDashboard";
import Navbar from "@/components/Sides/Navbar/Navbar";
import Aside from "@/components/Sides/Aside/Aside";
import { motion } from "framer-motion";

function Dashboard() {
    return (
        <div className="bg-sipe-blue-dark">
            
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
                            <div className="p-5 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-1 gap-5 h-full">
                                <MainDashboard />
                            </div>
                        </motion.div>
                    </div>
                </section>
        </div>
    );
}

export default Dashboard;
