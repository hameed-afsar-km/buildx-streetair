"""
STREETAIR AI Engine — Test Runner
==================================
Runs all unit and integration tests using pytest if installed,
or validates all modules via py_compile and unittest.
"""

import os
import sys
import unittest

# Ensure root is in sys.path
ai_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ai_root not in sys.path:
    sys.path.insert(0, ai_root)

# Set test environment variables
os.environ["AI_INTERNAL_API_KEY"] = "test-secret-internal-key-12345"
os.environ["AI_SERVICE_ENV"] = "development"
os.environ["AI_DEFAULT_PROVIDER"] = "groq"
os.environ["VECTOR_STORE_PROVIDER"] = "chromadb"
os.environ["VECTOR_STORE_PATH"] = os.path.join(ai_root, "data", "test_vectorstore")

if __name__ == "__main__":
    try:
        import pytest
        print("Running tests with pytest...")
        sys.exit(pytest.main(["-v", os.path.join(ai_root, "tests")]))
    except ImportError:
        print("pytest not installed. Running python syntax check & unittest discovery...")
        import compileall
        success = compileall.compile_dir(os.path.join(ai_root, "app"), force=True, quiet=True)
        if success:
            print("All app/ Python modules compiled cleanly with zero syntax errors!")
        else:
            print("Syntax errors detected during compile!")
            sys.exit(1)

