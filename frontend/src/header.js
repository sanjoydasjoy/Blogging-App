import { useState, useEffect, useContext } from 'react';
import{Link} from "react-router-dom"
import { UserContext } from "./UserContext"

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function Header(){

  const {setUserInfo,userInfo} = useContext(UserContext)

  useEffect(()=>{
    fetch(`${API_BASE_URL}/profile`,{
      credentials: 'include'
    }).then(response=>{
      response.json().then(userInfo =>{
        setUserInfo(userInfo)
      })
    })
  },[])

  function logout(){
    fetch(`${API_BASE_URL}/logout`,{
      credentials: "include",
      method: 'POST'
    })
    setUserInfo(null)
  }

  const username =userInfo?.username
  
    return(
        <header>
        <Link to="/" className="logo">MyBlog</Link>
        <nav>
          {username && (
            <>
            <Link to="/create">Create new post</Link>
            <a onClick={logout}>Logout</a>
            </>
          )}
          {!username && (
            <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            </>
          )} 
        </nav>
      </header>
    )
}