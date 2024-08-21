import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Switch } from "@nextui-org/react";
import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from 'lucide-react';
import Icon from "../ui/Icon";
import { TEMPLATE_ICON_COLOR } from "../../constant/colors";
import * as LucidIcons from 'lucide-react';

type IconName = keyof typeof LucidIcons;

interface HeaderProps {
    name?: string;
    icon?: string
}

const Header = ({name, icon}: HeaderProps) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Navbar position="static" isBordered isBlurred={true} maxWidth="full" className="z-auto">
            <NavbarBrand>
                {icon && (
                    <Icon 
                        name={icon as IconName} 
                        size={30}
                        color={TEMPLATE_ICON_COLOR}
                    />
                )}
                <p className={`font-bold text-inherit ${icon ? 'ml-2' : ''}`}>{name}</p>
            </NavbarBrand>
            <NavbarContent justify="end">
                <NavbarItem>
                    <Switch
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        size="md"
                        classNames={{
                            wrapper: "group-data-[selected=true]:bg-theme-800",
                        }}
                        startContent={<SunIcon />}
                        endContent={<MoonIcon />}
                    />
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}

export default Header;