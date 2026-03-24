import{Outlet} from "react-router-dom"
import Header from "./header"
import { motion } from 'framer-motion';

export default function Layout(){
    return(
        <div className="app-shell">
            <div className="bg-layer" aria-hidden="true" />
            <motion.main
                className="site-main"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
            >
                <Header />
                <Outlet />
            </motion.main>
        </div>
    )
}