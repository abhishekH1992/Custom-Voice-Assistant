import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Switch } from "@nextui-org/react";
import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from 'lucide-react';
import Icon from "../ui/Icon";
import { TEMPLATE_ICON_COLOR } from "../../constant/colors";

const Header = ({name, icon}) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Navbar position="sticky" isBordered isBlurred={true} maxWidth="full">
            <NavbarBrand>
                {icon && (
                    <Icon 
                        name={icon} 
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