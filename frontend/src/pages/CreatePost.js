import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Navigate } from 'react-router-dom';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image'
];

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState(null);
    const [redirect, setRedirect] = useState(false);

    async function createNewPost(ev) {
        ev.preventDefault();

        const data = new FormData();
        data.append('title', title);
        data.append('summary', summary);
        data.append('content', content);
        if (files) {
            data.append('file', files[0]);
        }

        const response = await fetch('http://localhost:4000/post', {
            method: 'POST',
            body: data,
            credentials:'include'
        });

        if(response.ok){
            setRedirect(true)
        }
    }
    if(redirect){
        return <Navigate to={'/'} />
    }

    return (
        <div>
            <form onSubmit={createNewPost}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={ev => setTitle(ev.target.value)}
                />
                <input
                    type="text"
                    placeholder="Summary"
                    value={summary}
                    onChange={ev => setSummary(ev.target.value)}
                />
                <input
                    type="file"
                    onChange={ev => setFiles(ev.target.files)}
                />
                <ReactQuill
                    value={content}
                    onChange={newValue => setContent(newValue)}
                    modules={modules}
                    formats={formats}
                />
                <button style={{ marginTop: '5px' }}>Create Post</button>
            </form>
        </div>
    );
}
