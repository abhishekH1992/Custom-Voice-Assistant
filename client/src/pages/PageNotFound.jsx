import { Button, Text, Container, Row, Col } from "@nextui-org/react";
import Link from "next/link";

const PageNotFound = () => {
    return (
        <Container
            display="flex"
            justify="center"
            alignItems="center"
            css={{ height: "100vh", textAlign: "center" }}
        >
            <Row justify="center">
                <Col css={{ textAlign: "center" }}>
                    <Text h1 size={70} weight="bold" css={{ lineHeight: 1.2 }}>
                        404
                    </Text>
                    <Text h3 size={20} css={{ marginBottom: "$10" }}>
                        Oops! The page you&apos;re looking for doesn&apos;t exist.
                    </Text>
                    <Text h5 size={16} css={{ marginBottom: "$15" }}>
                        It seems like you&apos;ve reached a broken link or the page has moved.
                    </Text>
                    <Link href="/" passHref>
                        <Button shadow color="gradient" auto>
                        Go back to Home
                        </Button>
                    </Link>
                </Col>
            </Row>
        </Container>
    );
}

export default PageNotFound;