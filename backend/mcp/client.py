import os
import sys
import asyncio
from typing import Dict, Any, Callable
from mcp.client.stdio import stdio_client
from mcp import ClientSession, StdioServerParameters

# Paths to the server scripts
MCP_DIR = os.path.dirname(os.path.abspath(__file__))
PAPER_SERVER_PATH = os.path.join(MCP_DIR, "paper_server.py")
GITHUB_SERVER_PATH = os.path.join(MCP_DIR, "github_server.py")
FILESYSTEM_SERVER_PATH = os.path.join(MCP_DIR, "filesystem_server.py")

class MCPClientManager:
    """
    Manages connections to the local MCP servers (PaperSearch, GithubSearch, Filesystem).
    Exposes a unified interface to invoke tools.
    """
    
    def __init__(self):
        self.use_fallback = False
        
        # Check if python executable path is available
        self.python_exe = sys.executable or "python"
        
        # Pre-import tool functions as a fallback if subprocess launching fails
        try:
            from backend.mcp.paper_server import search_papers
            from backend.mcp.github_server import search_github
            from backend.mcp.filesystem_server import save_notes, read_pdf
            self.fallback_tools = {
                "search_papers": search_papers,
                "search_github": search_github,
                "save_notes": save_notes,
                "read_pdf": read_pdf
            }
        except ImportError:
            # Absolute import fallback path fallback
            sys.path.append(os.path.dirname(os.path.dirname(MCP_DIR)))
            try:
                from backend.mcp.paper_server import search_papers
                from backend.mcp.github_server import search_github
                from backend.mcp.filesystem_server import save_notes, read_pdf
                self.fallback_tools = {
                    "search_papers": search_papers,
                    "search_github": search_github,
                    "save_notes": save_notes,
                    "read_pdf": read_pdf
                }
            except Exception:
                self.fallback_tools = {}

    async def call_tool(self, server_name: str, tool_name: str, arguments: Dict[str, Any]) -> str:
        """
        Executes an MCP tool. It tries the stdio transport subprocess first.
        If it fails or triggers an error, it falls back to direct import execution.
        """
        # Select appropriate server script
        if server_name == "papers":
            script_path = PAPER_SERVER_PATH
        elif server_name == "github":
            script_path = GITHUB_SERVER_PATH
        elif server_name == "filesystem":
            script_path = FILESYSTEM_SERVER_PATH
        else:
            return f"Error: Unknown server '{server_name}'"
            
        if self.use_fallback or not os.path.exists(script_path):
            return self._execute_fallback(tool_name, arguments)
            
        try:
            # Standard stdio MCP execution
            server_params = StdioServerParameters(
                command=self.python_exe,
                args=[script_path]
            )
            
            # Connect and execute in async context
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as client:
                    await client.initialize()
                    result = await client.call_tool(tool_name, arguments)
                    
                    # Extract string result
                    if hasattr(result, "content"):
                        content = result.content
                        if isinstance(content, list) and len(content) > 0:
                            return getattr(content[0], "text", str(content[0]))
                        return str(content)
                    return str(result)
                    
        except Exception as e:
            # Fallback to direct python imports if subprocess fails
            print(f"[MCP Stdio Connection Failed for {server_name}. Falling back to in-process execution]: {str(e)}")
            return self._execute_fallback(tool_name, arguments)
            
    def _execute_fallback(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """
        Executes the tools in-process, bypassing the stdin/stdout subprocess logic.
        """
        if tool_name not in self.fallback_tools:
            return f"Error: Tool '{tool_name}' not available in fallback registry."
            
        try:
            func = self.fallback_tools[tool_name]
            # Call python function synchronously
            result = func(**arguments)
            return str(result)
        except Exception as e:
            return f"Error executing fallback tool '{tool_name}': {str(e)}"

# Global singleton client manager
mcp_client = MCPClientManager()
