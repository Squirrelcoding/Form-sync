import { Box } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip"

interface BlockProps {
    brightness: number,
    maxBrightness: number
}

export default function Block({ brightness, maxBrightness }: BlockProps) {
    return <Tooltip content={maxBrightness} positioning={{placement: "right-end"}}>
        <Box
                width="15px"
                height="15px"
                bg="green.500"
                borderRadius="2px"
                filter={`brightness(${brightness})`}
            />
    </Tooltip>
}