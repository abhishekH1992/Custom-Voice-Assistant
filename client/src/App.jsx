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
import SavedChats from './pages/SavedChats';
import PageNotFound from './pages/PageNotFound';
import AuthSkeleton from './components/ui/skeleton/AuthSkeleton';
import CardSkeleton from './components/ui/skeleton/CardSkeleton';
import Header from './components/nav/Header';

const ProtectedRoute = ({ children }) => {
    const { loading, error, data } = useQuery(ME_QUERY);
    if(loading) return null;
    if (error) {
        localStorage.removeItem('token');
        return <Navigate to="/login" />;
    }
    
    return React.cloneElement(children, { userData: data });
}

const AuthRoute = ({ children }) => {
    const { loading, error, data } = useQuery(ME_QUERY);
    if (loading) return <AuthSkeleton />;
    if (!error && data) {
        // User is authenticated, redirect to home
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    const location = useLocation();
    const isTemplatePage = location.pathname.startsWith('/template/');
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const { loading, error, data: userData } = useQuery(ME_QUERY);

    if (error && !isAuthPage) return <Navigate to="/login" />;

    return (
        <div className="flex h-screen overflow-y-hidden scrollbar-hide">
            {!isAuthPage && (
                <SideNav userData={userData}>
                    <SidebarItem icon={<AudioLines size={20} />} text="Voice Chat" to="/" active/>
                    <SidebarItem icon={<SaveAllIcon size={20} />} text="Saved Chat" to="/saved-chats" />
                </SideNav>
            )}
            <main className={`flex-1 flex flex-col ${isAuthPage ? 'w-full' : ''}`}>
                <div className={`flex-1 ${isTemplatePage ? '' : 'overflow-y-auto scrollbar-hide'}`}>
                    {loading && !isAuthPage ? (
                        <>
                            <Header isLoading={true} />
                            <div className="px-6 my-5 sm:mt-6">
                                <div className="grid grid-cols-1 gap-5 s:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 max-w-940 m-auto">
                                    {[...Array(6)].map((_, index) => (
                                        <CardSkeleton key={index} />
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <Routes>
                            <Route path='/login' element={
                                <AuthRoute>
                                    <Login />
                                </AuthRoute>
                            } />
                            <Route path='/register' element={
                                <AuthRoute>
                                    <Register />
                                </AuthRoute>
                            } />
                            <Route path='/' element={
                                <ProtectedRoute>
                                    <TemplateList />
                                </ProtectedRoute>
                            } />
                            <Route path='/saved-chats' element={
                                <ProtectedRoute>
                                    <SavedChats />
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
                            <Route path='*' element={
                                <ProtectedRoute>
                                    <PageNotFound />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    )}
                </div>
            </main>
            <Toaster />
        </div>
    );
}

export default App;