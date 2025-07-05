import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button, Flex, Card, Text } from "@chakra-ui/react"
import NextLink from 'next/link'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <>
      <Text fontSize="4xl" mb={8} textAlign="center">
        Logged in as {data.user.email}
      </Text>
      <Flex gap={6} direction="row" wrap="wrap" justify={"center"}>
        <Card.Root maxW="sm" flex="1">
          <Card.Header>Compare against image</Card.Header>
          <Card.Body>
            Upload an image (usually of a static pose) and try to match it.
          </Card.Body>
          <Card.Footer>
            <Button as={NextLink} href="/image" color="white" bg="#3182ce">
              Go
            </Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root maxW="sm" flex="1">
          <Card.Header>Compare against video</Card.Header>
          <Card.Body>
            Upload a video and follow the coach's form in real time.
          </Card.Body>
          <Card.Footer>
            <Button as={NextLink} href="/video" color="white" bg="#3182ce">
              Go
            </Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root maxW="sm" flex="1">
          <Card.Header>Compare against coach</Card.Header>
          <Card.Body>
            Start a session or enter a join code to join a video call and compare your movements with a coach's.
          </Card.Body>
          <Card.Footer>
            <Button as={NextLink} href="/call" color="white" bg="#3182ce">
              Go
            </Button>
          </Card.Footer>
        </Card.Root>
      </Flex>
    </>
  )
}
