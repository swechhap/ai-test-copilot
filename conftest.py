"""Fixtures: browser configuration, a shared logged-in session, and page objects."""
import uuid
from dataclasses import dataclass

import pytest

import config
from pages.dashboard_page import DashboardPage
from pages.employee_page import AddEmployeePage, EmployeeListPage
from pages.leave_page import ApplyLeavePage, LeaveListPage, MyLeavePage
from pages.login_page import LoginPage


# --- environment --------------------------------------------------------
@pytest.fixture(scope="session")
def base_url(request):
    return request.config.getoption("--base-url") or config.BASE_URL


# --- authentication -----------------------------------------------------
@pytest.fixture(scope="session")
def auth_state(browser, base_url, tmp_path_factory):
    """Log in once per session and hand back a reusable storage-state file.

    Replaying cookies keeps every authenticated test from paying for its own
    round trip through the login form.
    """
    state_file = tmp_path_factory.mktemp("auth") / "storage_state.json"
    context = browser.new_context(base_url=base_url)
    page = context.new_page()
    LoginPage(page).open().login_and_wait(config.USERNAME, config.PASSWORD)
    context.storage_state(path=state_file)
    context.close()
    return str(state_file)


@pytest.fixture
def browser_context_args(browser_context_args, auth_state, request):
    """Start every context logged in, unless the test asks to be anonymous."""
    if request.node.get_closest_marker("anonymous"):
        return browser_context_args
    return {**browser_context_args, "storage_state": auth_state}


# --- page objects -------------------------------------------------------
@pytest.fixture
def login_page(page):
    return LoginPage(page)


@pytest.fixture
def dashboard_page(page):
    return DashboardPage(page)


@pytest.fixture
def leave_list_page(page):
    return LeaveListPage(page)


@pytest.fixture
def apply_leave_page(page):
    return ApplyLeavePage(page)


@pytest.fixture
def my_leave_page(page):
    return MyLeavePage(page)


@pytest.fixture
def employee_list_page(page):
    return EmployeeListPage(page)


@pytest.fixture
def add_employee_page(page):
    return AddEmployeePage(page)


# --- test data ----------------------------------------------------------
@dataclass(frozen=True)
class Employee:
    first_name: str
    last_name: str
    emp_number: str

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


@pytest.fixture
def new_employee(add_employee_page, employee_list_page):
    """Create employees on demand and clean them up afterwards.

    The target is a shared demo instance, so names are randomised to keep
    concurrent runs from colliding and teardown always removes what it made.
    """
    created: list[Employee] = []

    def _create(last_name: str = "Copilot") -> Employee:
        first_name = f"Qa{uuid.uuid4().hex[:8]}"
        emp_number = add_employee_page.open().create(first_name, last_name)
        record = Employee(first_name, last_name, emp_number)
        created.append(record)
        return record

    yield _create

    for record in created:
        employee_list_page.delete_if_present(record.first_name)
