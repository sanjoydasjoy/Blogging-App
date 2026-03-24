import './App.css';
import Layout from './layout';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import EditPost from './pages/EditPost';
import BookmarksPage from './pages/BookmarksPage';
import DashboardPage from './pages/DashboardPage';
import { Route, Routes } from "react-router-dom";
import { UserContextProvider } from './UserContext';

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route index element={<IndexPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/create' element={<CreatePost />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/bookmarks' element={<BookmarksPage />} />
          <Route path='/post/:id' element={<PostPage />} />
          <Route path='/edit/:id' element={<EditPost />} />
        </Route>
      </Routes >
    </UserContextProvider>

  );
}

export default App;
