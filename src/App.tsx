import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Resources from './pages/Resources';
import Discussions from './pages/Discussions';
import Login from './pages/Login';
import PostDetails from './pages/PostDetails';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import './i18n';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="resources" element={<Resources />} />
          <Route path="discussions" element={<Discussions />} />
          <Route path="discussions/:id" element={<PostDetails />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:id" element={<BlogDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;