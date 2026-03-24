import { useState } from "react"

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function RegisterPage() {

    const [username,setUsername] = useState('')
    const [password,setPassword] = useState('')

    async function register(event){
        event.preventDefault()
        
        const response = await fetch(`${API_BASE_URL}/register`,{
            method:"POST",
            body:JSON.stringify({username,password}),
            headers: {'Content-Type' : 'application/json'}
        })
        if(response.status === 200){
            alert('Registration Successful!')
        }else{
            alert('Registration failed')
        }
    }

    return (
        <form className="register" onSubmit={register}>
            <h1>Register</h1>
            <input 
            type="text" 
            placeholder="username" 
            value={username}
            onChange={event=>setUsername(event.target.value)}
            />
            <input 
            type="password" 
            placeholder="password" 
            value={password}
            onChange={event=>setPassword(event.target.value)}
            />
            <button>Register</button>
        </form>
    )
}