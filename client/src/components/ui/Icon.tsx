import React from 'react';
import * as LucidIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';
import { useTheme } from "../../context/ThemeContext";

type IconName = keyof typeof LucidIcons;

interface IconProps extends Omit<LucideProps, 'ref'> {
    name: IconName;
}

const Icon: React.FC<IconProps> = ({ name, color, size }) => {
    const LucidIcon = LucidIcons[name] as React.ComponentType<LucideProps>;
    const { theme } = useTheme();

    return <LucidIcon color={theme === 'dark' ? '#fff' : color} size={size} />;
};

export default Icon;