"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button, Flex, Card, Text } from "@chakra-ui/react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function PrivatePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
    };
    checkUser();
  }, []);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Text fontSize="4xl" mb={8} textAlign="center">
        Logged in as {user.email}
      </Text>
      <Flex gap={6} direction="row" wrap="wrap" justify={"center"}>
        <Card.Root maxW="sm" flex="1">
          <Card.Header>Compare against image</Card.Header>
          <Card.Body>
            Upload an image of a pose and try to match it.
          </Card.Body>
          <Card.Footer>
            <Button color="white" bg="#3182ce">
              <Link href="/image">Go</Link>
            </Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root maxW="sm" flex="1">
          <Card.Header>Compare against video</Card.Header>
          <Card.Body>
            Upload a video and follow the coach's form in real time.
          </Card.Body>
          <Card.Footer>
            <Button color="white" bg="#3182ce">
              <Link href="/video">Go</Link>
            </Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root maxW="sm" flex="1">
          <Card.Header>Compare against coach</Card.Header>
          <Card.Body>
            Start a session or enter a join code to join a video call and compare your movements with a coach's.
          </Card.Body>
          <Card.Footer>
            <Button color="white" bg="#3182ce">
              <Link href="/call">Start call</Link>
            </Button>
          </Card.Footer>
        </Card.Root>
      </Flex>
    </>
  );
}
