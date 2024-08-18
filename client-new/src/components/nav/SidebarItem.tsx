import React, { useContext, ReactNode } from "react";
import { SidebarContext } from "./SideNav";
import { useTheme } from "../../context/ThemeContext";

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
}

const SidebarItem = ({ icon, text, active }: SidebarItemProps) => {
    const context = useContext(SidebarContext);
    const { theme } = useTheme();
  
    if (!context) {
        throw new Error('SidebarItem must be used within a SideNav');
    }
  
    const { expanded } = context;
  
    return (
        <li
            className={`
                relative flex items-center py-2 px-3 my-1
                font-medium rounded-md cursor-pointer
                transition-colors group
                ${
                active
                    ? theme === 'dark'
                        ? "bg-gradient-to-tr from-indigo-800 to-indigo-900 text-indigo-100"
                        : "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                    : theme === 'dark'
                        ? "hover:bg-indigo-900 text-gray-400"
                        : "hover:bg-indigo-50 text-gray-600"
                }
            `}
        >
            {icon}
            <span
                className={`overflow-hidden transition-all ${
                expanded ? "w-52 ml-3" : "w-0"
                }`}
            >
                {text}
            </span>
            {!expanded && (
                <div
                className={`
                absolute left-full rounded-md px-2 py-1 ml-6
                ${theme === 'dark' ? 'bg-indigo-900 text-indigo-100' : 'bg-indigo-100 text-indigo-800'}
                text-sm
                invisible opacity-20 -translate-x-3 transition-all
                group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            `}
                >
                {text}
                </div>
            )}
        </li>
    );
}

export default SidebarItem;