---
name: Stitch MCP generation timeout
description: Stitch MCP generate_screen_from_text consistently times out (~2min limit). Use Stitch UI for generation, MCP for read/update operations.
type: feedback
---

Stitch MCP generation tools (generate, edit, variants) time out on the client side (~2min), BUT the screens DO generate on the backend. They appear in the Stitch dashboard after the timeout.

**Why:** The MCP connection timeout is shorter than Stitch's generation time. The tool docs confirm this: "the generation process may still succeed."

**How to apply:** Fire off generation calls, accept the timeout, then use list_screens or get_screen to check results afterward. Can also fire-and-forget multiple generations. For reviewing results visually, the user checks the Stitch dashboard directly.
