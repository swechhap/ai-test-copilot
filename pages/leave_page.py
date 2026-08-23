"""Leave module: the leave list report and the apply-leave form."""
from pages.base_page import BasePage

# Column offsets in the leave results table (cell 0 is the empty selector cell).
DATE = 1
EMPLOYEE = 2
LEAVE_TYPE = 3
STATUS = 6


class LeaveListPage(BasePage):
    """Leave > Leave List — the admin view across all employees."""

    path = "/leave/viewLeaveList"

    @property
    def from_date(self):
        return self.page.locator(".oxd-date-input input").nth(0)

    @property
    def to_date(self):
        return self.page.locator(".oxd-date-input input").nth(1)

    @property
    def status_chips(self):
        """Currently selected values in the "Show Leave with Status" multiselect."""
        return self.page.locator(".oxd-chip")

    @property
    def employee_name(self):
        return self.input_group("Employee Name").locator("input")

    def filter_labels(self) -> list[str]:
        return [label.strip() for label in self.page.locator(".oxd-label").all_text_contents()]

    def selected_statuses(self) -> list[str]:
        return [chip.strip() for chip in self.status_chips.all_text_contents()]

    def set_date_range(self, start: str, end: str):
        """Dates use the app's yyyy-mm-dd display format."""
        self.from_date.fill(start)
        self.to_date.fill(end)
        return self

    def column(self, index: int) -> list[str]:
        """Read one column across every result row."""
        return [
            row.locator(".oxd-table-cell").nth(index).inner_text().strip()
            for row in self.rows.all()
        ]


class ApplyLeavePage(BasePage):
    """Leave > Apply — only usable by an account holding a leave entitlement."""

    path = "/leave/applyLeave"

    @property
    def no_balance_message(self):
        return self.page.get_by_text("No Leave Types with Leave Balance")

    @property
    def leave_type(self):
        return self.input_group("Leave Type").locator(".oxd-select-text")

    def has_balance(self) -> bool:
        return self.leave_type.count() > 0


class MyLeavePage(BasePage):
    """Leave > My Leave — the signed-in user's own requests."""

    path = "/leave/viewMyLeaveList"

    @property
    def status_chips(self):
        return self.page.locator(".oxd-chip")

    def selected_statuses(self) -> list[str]:
        return [chip.strip() for chip in self.status_chips.all_text_contents()]
