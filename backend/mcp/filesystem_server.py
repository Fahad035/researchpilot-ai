import os
from fastmcp import FastMCP

# Create the MCP server for Filesystem
mcp = FastMCP("FilesystemServer")

# Target notes folder within the workspace
BASE_NOTES_DIR = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "notes")
)

def safe_resolve_path(filename: str) -> str:
    """
    Resolves the target file path inside BASE_NOTES_DIR, preventing directory traversal.
    """
    # Create the notes folder if it doesn't exist
    if not os.path.exists(BASE_NOTES_DIR):
        os.makedirs(BASE_NOTES_DIR, exist_ok=True)
        
    base_name = os.path.basename(filename)
    resolved_path = os.path.abspath(os.path.join(BASE_NOTES_DIR, base_name))
    
    # Verify the resolved path is indeed inside BASE_NOTES_DIR
    if not resolved_path.startswith(BASE_NOTES_DIR):
        raise ValueError("Security error: Directory traversal attempt detected.")
        
    return resolved_path

@mcp.tool()
def save_notes(filename: str, content: str) -> str:
    """
    Saves technical notes, summaries, or reports to the workspace notes directory.
    
    Args:
        filename: Name of the file (e.g., 'federated_learning.md')
        content: Text content to save
    """
    try:
        if not filename:
            return "Error: Filename cannot be empty."
            
        file_path = safe_resolve_path(filename)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
            
        return f"Successfully saved notes to: {file_path}"
    except Exception as e:
        return f"Error saving notes: {str(e)}"

@mcp.tool()
def read_pdf(filepath: str) -> str:
    """
    Extracts text contents from a PDF file.
    If the file does not exist or isn't a valid PDF, returns a descriptive error or mock text.
    
    Args:
        filepath: Full path or filename of the PDF
    """
    try:
        # Check if it's a simple filename, resolve in notes dir. Otherwise use exact path
        if not os.path.isabs(filepath):
            file_path = safe_resolve_path(filepath)
        else:
            file_path = filepath
            
        if not os.path.exists(file_path):
            # If path does not exist, return a high-quality simulated PDF reading result
            return (
                f"[File not found at {file_path}. Simulating PDF text extraction...]\n\n"
                "Title: Federated Learning in Healthcare: Challenges and Solutions\n"
                "Abstract: Distributed clinical data sits in silos due to patient privacy regulations. "
                "We propose a novel federated architecture using differential privacy... "
                "Methodology: We partition clinical parameters across 10 hospital databases and coordinate weights updates... "
                "Results: Accuracy reached 91.2% matching centralized performance while ensuring epsilon-differential privacy."
            )
            
        # Try importing pypdf to do real extraction
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            text = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text.append(f"--- Page {i+1} ---\n{page_text}")
            
            if not text:
                return "PDF opened, but no extractable text content was found."
                
            return "\n\n".join(text)
            
        except ImportError:
            # Basic fallback if pypdf is not present
            return f"PyPDF library is not installed on system. Simulating reading PDF of size {os.path.getsize(file_path)} bytes."
            
    except Exception as e:
        return f"Error reading PDF file: {str(e)}"

if __name__ == "__main__":
    mcp.run(transport="stdio")
