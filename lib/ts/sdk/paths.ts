/**
 * This file provides one path type that merges all paths from different
 * versions of the schemas generated based on supported interface versions.
 */

import { paths as pathsV3_1 } from "./versions/3.1/schema";
import { paths as pathsV4_0 } from "./versions/4.0/schema";
import { paths as pathsV4_1 } from "./versions/4.1/schema";

type MergeMethods<M1, M2> = {
    [K in keyof M1 | keyof M2]: K extends keyof M1
        ? K extends keyof M2
            ? M1[K] | M2[K]
            : M1[K]
        : K extends keyof M2
        ? M2[K]
        : never;
};

type MergePaths<P1, P2> = {
    [K in keyof P1 | keyof P2]: K extends keyof P1
        ? K extends keyof P2
            ? MergeMethods<P1[K], P2[K]>
            : P1[K]
        : K extends keyof P2
        ? P2[K]
        : never;
};

type MergeManyPaths<T extends Record<string, any>[]> = T extends [infer First, ...infer Rest]
    ? First extends Record<string, any>
        ? Rest extends Record<string, any>[]
            ? MergePaths<First, MergeManyPaths<Rest>>
            : First
        : never
    : {};

// TODO: Remove this once the new API spec is merged
// export type paths = MergeManyPaths<[pathsV3_1, pathsV4_0, pathsV4_1]>;
export type paths = pathsV4_1;
