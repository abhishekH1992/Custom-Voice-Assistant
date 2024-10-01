import { useState } from 'react';
import { Input, Button, Link } from "@nextui-org/react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { LOGIN_MUTATION } from "../../graphql/mutations/auth.mutation";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const [login, { loading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: ({ login }) => {
            localStorage.setItem('token', login.token);
            console.log(login.token);
            toast.success('Login successful!');
            navigate('/');
        },
        onError: (error) => {
            try {
                const parsedError = JSON.parse(error.message);
                if (parsedError.code === 'BAD_USER_INPUT') {
                    if(parsedError.errors.general) {
                        toast.error(parsedError.errors.general);
                    } else {
                        toast.error('Login failed. Please try again.');
                    }
                } else {
                    throw new Error('Unexpected error structure');
                }
            } catch (e) {
                toast.error('An unexpected error occurred. Please refresh & try again.');
            }
        }
    });

    const validateForm = () => {
        let newErrors = {};
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        if (!formData.password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors
        if (validateForm()) {
            login({ variables: formData });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear the error for this field as the user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <div className="hidden md:block md:w-1/2 relative">
                <img
                    alt="Akoplus"
                    src="/images/auth.jpg"
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-theme-800 overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="flex gap-3 mb-6 justify-center">
                        <h1 className="text-2xl font-bold text-white">AkoPlus</h1>
                    </div>
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {errors.general}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            name="email"
                            label="Email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email}
                            startContent={<Mail className="text-xl text-default-400 pointer-events-none flex-shrink-0" />}
                        />
                        <Input
                            name="password"
                            label="Password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            errorMessage={errors.password}
                            type={showPassword ? "text" : "password"}
                            startContent={<Lock className="text-xl text-default-400 pointer-events-none flex-shrink-0" />}
                            endContent={
                                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <EyeOff className="text-xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <Eye className="text-xl text-default-400 pointer-events-none" />
                                    )}
                                </button>
                            }
                        />
                        <Button color="primary" type="submit" className="w-full" isLoading={loading}>
                            Login
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <Link href="/register" className="text-sm text-white">Don't have an account? Register here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;