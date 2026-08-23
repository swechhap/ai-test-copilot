"""Login screen: locators and actions."""
from pages.base_page import BasePage


class LoginPage(BasePage):
    path = "/auth/login"

    @property
    def username(self):
        return self.page.locator('input[name="username"]')

    @property
    def password(self):
        return self.page.locator('input[name="password"]')

    @property
    def submit_button(self):
        return self.page.locator('button[type="submit"]')

    @property
    def alert(self):
        """Banner shown for rejected credentials, e.g. "Invalid credentials"."""
        return self.page.locator(".oxd-alert-content-text")

    def login(self, username: str, password: str):
        """Fill both fields and submit. Does not wait for the outcome."""
        self.username.fill(username)
        self.password.fill(password)
        self.submit_button.click()
        return self

    def login_and_wait(self, username: str, password: str):
        """Log in and block until the dashboard has loaded."""
        self.login(username, password)
        self.page.wait_for_url("**/dashboard/index")
        return self
