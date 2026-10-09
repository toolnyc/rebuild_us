import { useCallback } from "react";
import { Button, Card, Flex, Stack, Text, useToast } from "@sanity/ui";
import { CopyIcon } from "@sanity/icons";
import { type SlugInputProps } from "sanity";

const ORIGIN = "https://www.rebuild.us";

export function SlugWithCopyLinks(props: SlugInputProps) {
  const toast = useToast();
  const slug = props.value?.current;

  const copy = useCallback(
    async (url: string, label: string) => {
      await navigator.clipboard.writeText(url);
      toast.push({ status: "success", title: `${label} link copied` });
    },
    [toast],
  );

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      {slug ? (
        <Flex gap={2} wrap="wrap">
          <Button
            icon={CopyIcon}
            mode="ghost"
            text="Copy English link"
            onClick={() => copy(`${ORIGIN}/share/${slug}`, "English")}
          />
          <Button
            icon={CopyIcon}
            mode="ghost"
            text="Copy Español link"
            onClick={() => copy(`${ORIGIN}/es/share/${slug}`, "Español")}
          />
        </Flex>
      ) : (
        <Card padding={2} radius={2} tone="transparent" border>
          <Text size={1} muted>
            Set a slug to get shareable links. Pages go live after the next
            publish-triggered rebuild.
          </Text>
        </Card>
      )}
    </Stack>
  );
}
