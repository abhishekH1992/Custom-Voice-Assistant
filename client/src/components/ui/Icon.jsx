import * as LucidIcons from 'lucide-react';
import { useTheme } from "../../context/ThemeContext";

const Icon = ({ name, color, size }) => {
    const LucidIcon = LucidIcons[name];
    const { theme } = useTheme();

    return <LucidIcon color={theme === 'dark' ? '#fff' : color} size={size} />;
};

export default Icon;