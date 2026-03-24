import {useContext, useState} from "react";
import {Link, Navigate} from "react-router-dom";
import { UserContext } from "../UserContext";
import { apiRequest, extractErrorMessage } from '../lib/api';
import { motion } from 'framer-motion';

export default function LoginPage() {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [redirect,setRedirect] = useState(false)
const [error, setError] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
const {setUserInfo} = useContext(UserContext)

async function login(ev) {
    ev.preventDefault();
    try {
        setIsSubmitting(true);
        setError('');
        const userInfo = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({username: username.trim(), password}),
            headers: {'Content-Type': 'application/json'},
        });

        setUserInfo(userInfo)
        setRedirect(true)
    } catch (err) {
        setError(extractErrorMessage(err, 'Login failed'));
    } finally {
        setIsSubmitting(false);
    }
}

if(redirect){
    return <Navigate to={'/'} />
}

return (
    <motion.section className="auth-shell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <form className="auth-card" onSubmit={login}>
            <p className="meta-kicker">Welcome Back</p>
            <h1>Log into your account</h1>
            {error && <p className="inline-error">{error}</p>}
            <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={ev=>setUsername(ev.target.value)}
            />
            <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={ev=>setPassword(ev.target.value)}
            />
            <button className="primary-btn" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Login'}</button>
            <p className="auth-footnote">
                New here? <Link to="/register">Create an account</Link>
            </p>
        </form>
        </motion.section>
    )
}