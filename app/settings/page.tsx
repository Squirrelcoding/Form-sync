import { Box, Button, Field, Flex, Input, Portal, Select, Text } from "@chakra-ui/react"

export default function Settings() {


    return <Box marginLeft="10" marginTop="2">
        <Text textStyle="6xl">Settings</Text>

        <Text textStyle="4xl" color="gray.300">Basic Information</Text>
        <Flex align="flex-end" gap={4} width="100%">
            <Box width="40%">
                <Field.Root>
                    <Field.Label>
                        Name
                    </Field.Label>
                    <Input placeholder="John Doe" />
                    <Field.ErrorText>Please enter a valid name</Field.ErrorText>
                </Field.Root>
            </Box>
            <Button>Save</Button>
        </Flex>

        <Flex align="flex-end" gap={4} width="100%">
            <Box width="40%">
                <Field.Root>
                    <Field.Label>
                        Pronouns
                    </Field.Label>
                    <Input placeholder="Jglke/Jglkem" />
                    <Field.HelperText>You may leave this blank</Field.HelperText>
                </Field.Root>
            </Box>
            <Button>Save</Button>
        </Flex>

        <Flex align="flex-end" gap={4} width="100%">
            <Box width="40%">
                <Field.Root>
                    <Field.Label>
                        Sex
                    </Field.Label>
                    <Input placeholder="Male/Female" />
                    <Field.HelperText>You may leave this blank</Field.HelperText>
                </Field.Root>
            </Box>
            <Button>Save</Button>
        </Flex>

        <Flex align="flex-end" gap={4} width="100%">
            <Box width="40%">
                <Field.Root>
                    <Field.Label>
                        Age
                    </Field.Label>
                    <Input/>
                </Field.Root>
            </Box>
            <Button>Save</Button>
        </Flex>


        <Text textStyle="4xl" color="gray.300">Social Media Connections</Text>
        <Text textStyle="4xl" color="gray.300">Privacy</Text>
        <Text textStyle="4xl" color="gray.300">Appearance</Text>
        <Text textStyle="4xl" color="red.400">Delete Account</Text>
    </Box>
}