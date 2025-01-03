import Navbar from "@/components/Sides/Navbar/Navbar";
import Aside from "@/components/Sides/Aside/Aside";
import toast, { Toaster } from 'react-hot-toast';
import { motion } from "framer-motion";
import Report from "@/components/Report/Report";

function Reports() {
    const notify = (type, message) => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            default:
                break;
        }
    };
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
                        <Report notify={notify} />
                    </div>
                </motion.div>
            </div>
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    className: '',
                    duration: 5000,
                    style: {
                        background: '#2C3B4D',
                        color: '#EEE9DF',
                    },
                }}
            />
        </section>
    );
}

export default Reports