"""Dashboard: the landing page after a successful login."""
from pages.base_page import BasePage


class DashboardPage(BasePage):
    path = "/dashboard/index"

    @property
    def widgets(self):
        return self.page.locator(".orangehrm-dashboard-widget")

    @property
    def menu_items(self):
        return self.page.locator(".oxd-main-menu-item--name")

    def menu_labels(self) -> list[str]:
        return [label.strip() for label in self.menu_items.all_text_contents()]

    def go_to(self, module: str):
        """Click a left-hand sidebar module, e.g. "Leave" or "PIM"."""
        self.menu_items.filter(has_text=module).first.click()
        self.page.wait_for_load_state("networkidle")
        return self
