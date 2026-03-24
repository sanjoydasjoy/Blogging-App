import Post from "../post"
import {useState,useEffect} from 'react'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

//The .. in the path means "go up one directory level."
//Since IndexPage.js is in the pages directory, ../post tells the import statement to move up one level from pages to src, and then look for the post.js file.


export default function IndexPage() {
    const [posts, setPosts] = useState([])
    useEffect(() => {
        fetch(`${API_BASE_URL}/post`).then(response => {
            response.json().then(posts => {
                setPosts(posts);
            })
        })
    }, []);
    return (
        <>
            {posts.length > 0 && posts.map(post => (
                <Post {...post}/>
            ))}

        </>
    )
}