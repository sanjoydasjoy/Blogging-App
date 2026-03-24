import { useState } from "react"
import { Link, Navigate } from "react-router-dom";
import { apiRequest, extractErrorMessage } from '../lib/api';
import { motion } from 'framer-motion';

export default function RegisterPage() {

    const [username,setUsername] = useState('')
    const [password,setPassword] = useState('')
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [redirect, setRedirect] = useState(false);

    async function register(event){
        event.preventDefault()

        if (username.trim().length < 4) {
            setError('Username must be at least 4 characters');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            await apiRequest('/register', {
                method:"POST",
                body:JSON.stringify({username: username.trim(), password}),
                headers: {'Content-Type' : 'application/json'}
            });

            setRedirect(true);
        } catch (err) {
            setError(extractErrorMessage(err, 'Registration failed'));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (redirect) {
        return <Navigate to="/login" />;
    }

    return (
        <motion.section className="auth-shell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <form className="auth-card" onSubmit={register}>
            <p className="meta-kicker">Join Scriptoria</p>
            <h1>Create your writer account</h1>
            {error && <p className="inline-error">{error}</p>}
            <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={event=>setUsername(event.target.value)}
            />
            <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={event=>setPassword(event.target.value)}
            />
            <button className="primary-btn" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Account'}</button>
            <p className="auth-footnote">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </form>
        </motion.section>
    )
}