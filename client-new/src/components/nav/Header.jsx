import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Switch } from "@nextui-org/react";
import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from 'lucide-react';
const Header = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Navbar position="static" isBordered isBlurred={true} maxWidth="full">
            <NavbarBrand>
                <p className="font-bold text-inherit">Simulator</p>
            </NavbarBrand>
            <NavbarContent justify="end">
                <NavbarItem>
                    <Switch
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        size="md"
                        classNames={{
                            wrapper: "group-data-[selected=true]:bg-indigo-800",
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