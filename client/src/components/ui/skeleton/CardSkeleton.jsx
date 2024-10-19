import { Card, CardHeader, CardBody, Skeleton } from "@nextui-org/react";

const CardSkeleton = () => {

  return (
        <Card 
            className="shadow-md"
        >
        <CardHeader className="justify-between">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-8 h-8" />
        </CardHeader>
        <CardBody>
            <Skeleton className="w-3/5 h-6 rounded-lg mb-2" />
            <Skeleton className="w-full h-4 rounded-lg mb-1" />
            <Skeleton className="w-full h-4 rounded-lg mb-1" />
            <Skeleton className="w-2/3 h-4 rounded-lg" />
        </CardBody>
        </Card>
  );
};

export default CardSkeleton;