import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import Block from "./Block";

export default function DailyProgress({ days }: { days: number[] }) {
    const totalDays = 365;
    const daysPerWeek = 8;
    const weeks = Math.ceil(totalDays / daysPerWeek);

    // Create 2D array: each subarray is one vertical week column
    const grid = Array.from({ length: weeks }, (_, weekIndex) =>
        Array.from({ length: daysPerWeek }, (_, dayIndex) => {
            const dayOfYear = weekIndex * daysPerWeek + dayIndex;
            return dayOfYear < totalDays ? dayOfYear : null; // fill only up to 365
        })
    );
    return <>
        <Flex>
            {grid.map((week, weekIdx) => (
                <Flex key={weekIdx} direction="column" gap="1px">
                    {week.map((day, dayIdx) =>
                        (day == 0 || day) ?
                            <Block brightness={(day! + 150) / 365} maxBrightness={day!} key={dayIdx} /> : <Box
                                width="15px"
                                height="15px"
                                bg="gray.500"
                                borderRadius="2px"
                            />
                    )}
                </Flex>
            ))}
        </Flex>
    </>
}