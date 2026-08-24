"""PIM module: employee search and the add/delete lifecycle."""
import re

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

from pages.base_page import BasePage

# Column offsets in the employee results table (cell 0 is the empty selector cell).
EMPLOYEE_ID = 1
FIRST_NAME = 2
LAST_NAME = 3

_EMP_NUMBER = re.compile(r"empNumber/(\d+)")


class AddEmployeePage(BasePage):
    """PIM > Add Employee."""

    path = "/pim/addEmployee"

    @property
    def first_name(self):
        return self.page.locator('input[name="firstName"]')

    @property
    def last_name(self):
        return self.page.locator('input[name="lastName"]')

    @property
    def save_button(self):
        return self.page.locator('button[type="submit"]')

    def create(self, first: str, last: str) -> str:
        """Save a new employee and return the id from the resulting profile URL.

        Saving redirects to the personal-details screen, so waiting on the URL is
        what tells us the record actually landed.
        """
        self.first_name.fill(first)
        self.last_name.fill(last)
        self.save_button.click()
        self.page.wait_for_url(_EMP_NUMBER, timeout=45_000)
        return _EMP_NUMBER.search(self.page.url).group(1)


class EmployeeListPage(BasePage):
    """PIM > Employee List."""

    path = "/pim/viewEmployeeList"

    @property
    def employee_name(self):
        return self.input_group("Employee Name").locator("input")

    @property
    def employee_id(self):
        return self.input_group("Employee Id").locator("input")

    @property
    def autocomplete_options(self):
        return self.page.locator(".oxd-autocomplete-option")

    @property
    def settled_autocomplete_option(self):
        """First hint once the dropdown stops showing its "Searching...." placeholder.

        Clicking the placeholder silently selects nothing, which turns a targeted
        search into an unfiltered one, so every lookup has to wait it out.
        """
        return self.autocomplete_options.filter(has_not_text="Searching....").first

    @property
    def confirm_delete_button(self):
        return self.page.locator(".oxd-dialog-sheet").get_by_role("button", name="Yes, Delete")

    def pick_employee_hint(self, name: str) -> bool:
        """Choose ``name`` from the autocomplete. False when it matches nobody."""
        self.employee_name.fill(name)
        option = self.settled_autocomplete_option
        option.wait_for(timeout=15_000)
        if "No Records Found" in option.inner_text():
            return False
        option.click()
        return True

    def search_by_name(self, name: str):
        """Type into the employee-name autocomplete, pick the hint, then search."""
        self.pick_employee_hint(name)
        return self.search()

    def search_by_id(self, employee_id: str):
        self.employee_id.fill(employee_id)
        return self.search()

    def full_names(self) -> list[str]:
        return [
            f"{row[FIRST_NAME]} {row[LAST_NAME]}".strip()
            for row in (self.row_values(i) for i in range(self.rows.count()))
        ]

    def delete_row(self, index: int = 0):
        self.rows.nth(index).locator("button:has(i.bi-trash)").click()
        self.confirm_delete_button.click()
        self.page.wait_for_load_state("networkidle")
        return self

    def delete_if_present(self, name: str) -> bool:
        """Delete the employee matching ``name``, returning False if already gone.

        Used for teardown, so it stays quiet when the test under it already removed
        the record. This runs against a shared demo instance, so it refuses to act
        unless the search narrowed to exactly the record it went looking for.
        """
        self.open()
        try:
            if not self.pick_employee_hint(name):
                return False
        except PlaywrightTimeoutError:
            return False
        self.search()
        if self.rows.count() != 1 or self.row_values()[FIRST_NAME] != name:
            return False
        self.delete_row()
        return True
