import { useContext, useState } from 'react';
import { Link, useNavigate } from "react-router-dom"
import { UserContext } from "./UserContext"
import { apiRequest, extractErrorMessage } from './lib/api';
import { motion } from 'framer-motion';

export default function Header(){
  const navigate = useNavigate();
  const {setUserInfo,userInfo} = useContext(UserContext)
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  async function logout(){
    try {
      setIsLoggingOut(true);
      await apiRequest('/logout', {
        method: 'POST',
      });
      setUserInfo(null)
      navigate('/');
    } catch (err) {
      setStatusMessage(extractErrorMessage(err, 'Could not log out right now'));
    } finally {
      setIsLoggingOut(false);
    }
  }

  const username =userInfo?.username
  const userInitial = username ? username.charAt(0).toUpperCase() : '';
  
    return(
      <>
        <motion.header
          className="topbar"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
        <Link to="/" className="logo">Scriptoria</Link>

        <motion.nav className="primary-nav" aria-label="Primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <a href="#latest">Discover</a>
          <a href="#topics">Signals</a>
          <a href="#about">Brand</a>
        </motion.nav>

        <motion.nav className="topnav" aria-label="Account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          {username && (
            <>
              <span className="welcome-chip">{userInitial}</span>
              <Link className="ghost-btn" to="/dashboard">Dashboard</Link>
              <Link className="ghost-btn" to="/bookmarks">Bookmarks</Link>
              <Link className="ghost-btn" to="/create">Write</Link>
              <button className="ghost-btn" onClick={logout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </>
          )}
          {!username && (
            <>
              <Link className="ghost-btn" to="/login">Login</Link>
              <Link className="primary-btn" to="/register">Create account</Link>
            </>
          )} 
        </motion.nav>
      </motion.header>
      {statusMessage && <p className="toast-error">{statusMessage}</p>}
      </>
    )
}