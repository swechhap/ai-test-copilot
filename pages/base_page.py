"""Shared behaviour for every OrangeHRM page object."""
import re

from playwright.sync_api import Page

APP_ROOT = "/web/index.php"

# OrangeHRM renders "(12) Records Found" / "(1) Record Found" above result tables.
_RECORD_COUNT = re.compile(r"\((\d+)\)\s+Records?\s+Found")


class BasePage:
    """Base class holding the locators shared by the authenticated shell.

    Subclasses set ``path`` (relative to ``/web/index.php``) and expose their own
    locators as properties so tests never touch raw selectors.
    """

    path: str = ""

    def __init__(self, page: Page):
        self.page = page

    # --- navigation -----------------------------------------------------
    def open(self):
        """Navigate to this page and wait for the Vue app to finish rendering.

        OrangeHRM is a single-page app: ``goto`` resolves while the shell is still
        empty, so every locator would race against hydration without this wait.
        """
        self.page.goto(f"{APP_ROOT}{self.path}")
        self.page.wait_for_load_state("networkidle")
        return self

    # --- app shell ------------------------------------------------------
    @property
    def breadcrumb(self):
        return self.page.locator(".oxd-topbar-header-breadcrumb")

    @property
    def user_dropdown(self):
        return self.page.locator(".oxd-userdropdown-name")

    @property
    def toast(self):
        return self.page.locator(".oxd-toast")

    @property
    def field_errors(self):
        return self.page.locator(".oxd-input-field-error-message")

    def logout(self):
        self.user_dropdown.click()
        self.page.get_by_role("menuitem", name="Logout").click()
        self.page.wait_for_url("**/auth/login")

    # --- result tables --------------------------------------------------
    @property
    def search_button(self):
        return self.page.locator('button[type="submit"]')

    @property
    def rows(self):
        return self.page.locator(".oxd-table-card")

    @property
    def column_headers(self):
        return self.page.locator(".oxd-table-header-cell")

    @property
    def no_records_message(self):
        return self.page.get_by_text("No Records Found")

    def record_count(self) -> int:
        """Read the "(N) Records Found" banner, or 0 when the table is empty."""
        banner = self.page.locator(".orangehrm-horizontal-padding span")
        if banner.count():
            match = _RECORD_COUNT.search(banner.first.inner_text())
            if match:
                return int(match.group(1))
        return 0

    def row_values(self, index: int = 0) -> list[str]:
        cells = self.rows.nth(index).locator(".oxd-table-cell")
        return [text.strip() for text in cells.all_text_contents()]

    def search(self):
        self.search_button.click()
        self.page.wait_for_load_state("networkidle")
        return self

    # --- forms ----------------------------------------------------------
    def input_group(self, label: str):
        """The form group whose ``.oxd-label`` matches ``label`` exactly.

        OrangeHRM reuses generic classes across every filter field, so anchoring
        on the visible label is the only stable way to tell them apart.
        """
        return self.page.locator(".oxd-input-group").filter(
            has=self.page.get_by_text(label, exact=True)
        )
