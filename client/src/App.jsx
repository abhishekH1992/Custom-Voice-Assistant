import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import SideNav from './components/nav/SideNav';
import SidebarItem from './components/nav/SidebarItem';
import { AudioLines, SaveAllIcon } from 'lucide-react';
import TemplateList from "./pages/TemplateList";
import Template from './pages/Template';
import { ME_QUERY } from './graphql/queries/me.query';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { Toaster } from "react-hot-toast"
import Feedback from './pages/Feedback';

const ProtectedRoute = ({ children }) => {
    const { loading, error, data } = useQuery(ME_QUERY);
  
    if (loading) return <div>Loading...</div>;
    if (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        return <Navigate to="/login" />;
    }
    
    return React.cloneElement(children, { userData: data });
}

function App() {
    const location = useLocation();
    const isTemplatePage = location.pathname.startsWith('/template/');
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className="flex h-screen overflow-y-hidden scrollbar-hide">
            {!isAuthPage && (
                <SideNav>
                    <SidebarItem icon={<AudioLines size={20} />} text="Voice Chat" to="/" active/>
                    <SidebarItem icon={<SaveAllIcon size={20} />} text="Saved Chat" to="/saved-chats" />
                </SideNav>
            )}
            <main className={`flex-1 flex flex-col ${isAuthPage ? 'w-full' : ''}`}>
                <div className={`flex-1 ${isTemplatePage ? '' : 'overflow-y-auto scrollbar-hide'}`}>
                    <Routes>
                        <Route path='/login' element={<Login />} />
                        <Route path='/register' element={<Register />} />
                        <Route path='/' element={
                            <ProtectedRoute>
                                <TemplateList />
                            </ProtectedRoute>
                        } />
                        <Route path='/template/:templateSlug' element={
                            <ProtectedRoute>
                                <Template />
                            </ProtectedRoute>
                        } />
                        <Route path='/template/:templateSlug/:savedChatId' element={
                            <ProtectedRoute>
                                <Template />
                            </ProtectedRoute>
                        } />
                        <Route path='/analytics/:templateSlug/:savedChatId' element={
                            <ProtectedRoute>
                                <Feedback />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </main>
            <Toaster />
        </div>
    );
}

export default App;