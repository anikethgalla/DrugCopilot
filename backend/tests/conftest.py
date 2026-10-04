import pytest
import sys
import os

# Add backend root to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


@pytest.fixture(autouse=True)
def setup_test_environment():
    os.environ["ENVIRONMENT"] = "testing"
    os.environ["NEO4J_URI"] = "bolt://localhost:7687"
