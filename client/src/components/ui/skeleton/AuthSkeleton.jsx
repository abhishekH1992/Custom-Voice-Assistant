import { Card, Skeleton } from "@nextui-org/react";

const AuthSkeleton = () => {

  return (
        <div className="flex h-screen bg-purple-700">
            <div className="hidden md:flex md:w-1/2">
                <Skeleton className="w-full h-full">
                    <div className="w-full h-full bg-default-300"></div>
                </Skeleton>
            </div>
    
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <Card className="w-full max-w-md p-6 space-y-6">
                    <Skeleton className="w-1/3 rounded-lg">
                        <div className="h-8 rounded-lg bg-default-300"></div>
                    </Skeleton>
                    
                    <Skeleton className="w-full rounded-lg">
                        <div className="h-12 rounded-lg bg-default-300"></div>
                    </Skeleton>
                    
                    <Skeleton className="w-full rounded-lg">
                        <div className="h-12 rounded-lg bg-default-300"></div>
                    </Skeleton>
                    
                    <Skeleton className="w-full rounded-lg">
                        <div className="h-12 rounded-lg bg-default-300"></div>
                    </Skeleton>
                    
                    <Skeleton className="w-2/3 mx-auto rounded-lg">
                        <div className="h-6 rounded-lg bg-default-300"></div>
                    </Skeleton>
                </Card>
            </div>
        </div>
    );
};

export default AuthSkeleton;