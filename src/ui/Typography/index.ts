// src/ui/Typography/index.ts

import { Heading } from "./Heading";
import type { HeadingProps } from "./Heading";

import { Text } from "./Text";
import type { TextProps } from "./Text";

/** Named exports */
export { Heading, Text };
export type { HeadingProps, TextProps };

/** Default export para usar como `Typography.Heading` / `Typography.Text` */
const Typography = { Heading, Text };
export default Typography;
