import { Routes, Route } from 'react-router-dom';
import SideNav from './components/nav/SideNav';
import SidebarItem from './components/nav/SidebarItem';
import { AudioLines } from 'lucide-react';
import TemplateList from "./pages/TemplateList";
import Template from './pages/Template';


function App() {
    return (
        <div className="flex h-screen overflow-hidden">
            <SideNav>
                <SidebarItem icon={<AudioLines size={20} />} text="Voice Chat" active />
            </SideNav>
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path='/' element={<TemplateList />} />
                        <Route path='/template/:templateSlug' element={<Template />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default App;