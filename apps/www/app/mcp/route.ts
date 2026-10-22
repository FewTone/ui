import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { packageManagers } from "@/lib/install";
import {
  findItem,
  getComponent,
  getExample,
  getInstall,
  instructions,
  listComponents,
  searchComponents,
  unknownItem,
} from "@/lib/mcp";

/*
 * The FewTone UI MCP server, at ui.fewtone.com/mcp (Streamable HTTP; mcp-handler on the MCP SDK v2). Keyless and
 * read-only: it lets an AI assistant find a component, read its docs and examples, and get the command that
 * installs it. The answers come from lib/mcp.ts, which reads the same index as the site. Stateless, so it runs
 * anywhere a route handler does. Clients: /docs/mcp. ADR 0012.
 */

const text = (body: string) => ({ content: [{ type: "text" as const, text: body }] });
const failure = (body: string) => ({ ...text(body), isError: true });
/** Every tool only reads the catalogue */
const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const name = z
  .string()
  .min(1)
  .describe('The component\'s name, as in list_components, for example "button" or "loading-button"');

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_components",
      {
        title: "List components",
        description:
          "Lists every FewTone UI component, grouped by category (Forms, Overlays, Navigation…), with a one-line description of each.",
        inputSchema: z.object({
          category: z.string().optional().describe("Only this category, for example Forms or Overlays"),
        }),
        annotations: readOnly,
      },
      ({ category }) => text(listComponents(category)),
    );

    server.registerTool(
      "search_components",
      {
        title: "Search components",
        description:
          'Finds the FewTone UI components that fit a need, best first. Takes keywords ("date picker") or a description of what the user wants to build ("a confirm step before deleting an account").',
        inputSchema: z.object({
          query: z.string().min(1).describe("Keywords or a short description of what's needed"),
          limit: z.number().int().min(1).max(20).default(5).describe("How many results, 5 by default"),
        }),
        annotations: readOnly,
      },
      ({ query, limit }) => text(searchComponents(query, limit)),
    );

    server.registerTool(
      "get_component",
      {
        title: "Get a component",
        description:
          "Reads one FewTone UI component's docs: when to use it, its install command, usage, every prop, its examples and what it installs with it. Set include_source to also get its full source code.",
        inputSchema: z.object({
          name,
          include_source: z.boolean().default(false).describe("Also return the component's source files"),
        }),
        annotations: readOnly,
      },
      async ({ name, include_source }) => {
        const item = findItem(name);
        return item ? text(await getComponent(item, include_source)) : failure(unknownItem(name));
      },
    );

    server.registerTool(
      "get_component_example",
      {
        title: "Get an example",
        description:
          "Returns the code of one of a component's examples (demos), with imports as they read in the user's project. Without an example name, returns the main one. get_component lists the examples.",
        inputSchema: z.object({
          name,
          example: z
            .string()
            .optional()
            .describe('The example\'s name from get_component, for example "sizes"'),
        }),
        annotations: readOnly,
      },
      async ({ name, example }) => {
        const item = findItem(name);
        return item ? text(await getExample(item, example)) : failure(unknownItem(name));
      },
    );

    server.registerTool(
      "get_install_command",
      {
        title: "Get the install command",
        description:
          "Returns the shadcn CLI command that adds one or more FewTone UI components to a project, with the requirements.",
        inputSchema: z.object({
          names: z
            .array(z.string().min(1))
            .min(1)
            .describe('Component names, for example ["button", "dialog"]'),
          package_manager: z
            .enum(packageManagers)
            .default("npm")
            .describe("The project's package manager: pnpm, npm, yarn or bun"),
        }),
        annotations: readOnly,
      },
      ({ names, package_manager }) => {
        const found = names.map(findItem);
        const missing = names.filter((_, index) => !found[index]);
        if (missing.length > 0) return failure(missing.map(unknownItem).join("\n"));
        return text(
          getInstall(
            found.filter((item) => item !== undefined),
            package_manager,
          ),
        );
      },
    );
  },
  { serverInfo: { name: "fewtone-ui", version: "1.0.0" }, instructions },
);

export { handler as DELETE, handler as GET, handler as POST };
