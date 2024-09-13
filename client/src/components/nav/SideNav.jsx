import { createContext, useState } from "react";
import { ChevronLast, ChevronFirst, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';

export const SidebarContext = createContext(undefined);

const SideNav = ({ children }) => {
    const [expanded, setExpanded] = useState(false);
    const { theme } = useTheme();
    const navigate = useNavigate();
    const client = useApolloClient();

    const logout = async () => {
        try {
          localStorage.removeItem('token');
          await client.resetStore();
          navigate('/login');
        } catch (error) {
          console.error('Logout error:', error);
        }
    };
  
    return (
        <aside className="h-screen">
            <nav className={`h-full flex flex-col border-r shadow-sm ${theme === 'dark' ? 'bg-gray-900 text-white border-nav-border' : 'bg-white text-gray-900'}`}>
                <div className="p-4 pb-2 flex justify-between items-center">
                    <img
                        src="https://img.logoipsum.com/243.svg"
                        className={`overflow-hidden transition-all ${
                        expanded ? "w-32" : "w-0"
                        }`}
                        alt=""
                    />
                    <button
                        onClick={() => setExpanded((curr) => !curr)}
                        className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                        {expanded ? <ChevronFirst /> : <ChevronLast />}
                    </button>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3">{children}</ul>
                </SidebarContext.Provider>

                <div className={`border-t flex p-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <img
                        src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
                        alt=""
                        className="w-10 h-10 rounded-md"
                    />
                    <div
                        className={`
                        flex justify-between items-center
                        overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
                    `}
                    >
                        <div className="leading-4">
                            <h4 className="font-semibold">John Doe</h4>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>johndoe@gmail.com</span>
                        </div>
                        <LogOut onClick={logout} className="cursor-pointer" />
                    </div>
                </div>
            </nav>
        </aside>
    );
}

export default SideNav;