import { Button, Link } from "@nextui-org/react";

const PageNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-7xl font-bold mb-4">404</h1>
            <p className="text-xl mb-2">Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
            <p className="text-lg mb-8">It seems like you&apos;ve reached a broken link or the page has moved.</p>
            <Link href="/" passHref>
                <Button shadow color="secondary" auto>
                    Go back to Home
                </Button>
            </Link>
        </div>
    );
}

export default PageNotFound;