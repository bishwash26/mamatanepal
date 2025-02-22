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
import PrivateRoute from './components/PrivateRoute';
import './i18n';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="resources" element={
            <PrivateRoute>
              <Resources />
            </PrivateRoute>
          } />
          <Route path="discussions" element={
            <PrivateRoute>
              <Discussions />
            </PrivateRoute>
          } />
          <Route path="discussions/:id" element={
            <PrivateRoute>
              <PostDetails />
            </PrivateRoute>
          } />
          <Route path="blogs" element={
            <PrivateRoute>
              <Blogs />
            </PrivateRoute>
          } />
          <Route path="blogs/:id" element={
            <PrivateRoute>
              <BlogDetail />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;