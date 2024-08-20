import { Routes, Route } from 'react-router-dom';
import SideNav from './components/nav/SideNav';
import SidebarItem from './components/nav/SidebarItem';
import Header from './components/nav/Header';
import { AudioLines } from 'lucide-react';
import TemplateList from "./pages/TemplateList";

function App() {
    return (
        <div className="flex h-screen overflow-hidden">
            <SideNav>
                <SidebarItem icon={<AudioLines size={20} />} text="Voice Chat" active />
            </SideNav>
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <div className="flex-1 px-6 overflow-y-auto sm:mt-6">
                    <Routes>
                        <Route path='/' element={<TemplateList />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default App;