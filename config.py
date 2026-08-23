"""Environment configuration for the OrangeHRM test suite."""
import os

BASE_URL = os.getenv("ORANGEHRM_BASE_URL", "https://opensource-demo.orangehrmlive.com")

# The public demo publishes these credentials on its login page.
USERNAME = os.getenv("ORANGEHRM_USERNAME", "Admin")
PASSWORD = os.getenv("ORANGEHRM_PASSWORD", "admin123")
