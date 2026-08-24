"""PIM module: employee search plus the create/read/delete lifecycle."""
import pytest
from playwright.sync_api import expect

from pages.employee_page import FIRST_NAME, LAST_NAME


def test_add_employee_requires_a_last_name(add_employee_page):
    add_employee_page.open()
    add_employee_page.first_name.fill("Nolastname")
    add_employee_page.save_button.click()

    expect(add_employee_page.field_errors).to_have_text(["Required"])


@pytest.mark.crud
def test_created_employee_is_saved_and_searchable(new_employee, employee_list_page):
    employee = new_employee()

    employee_list_page.open().search_by_name(employee.first_name)

    expect(employee_list_page.rows).to_have_count(1)
    assert employee_list_page.record_count() == 1
    row = employee_list_page.row_values()
    assert row[FIRST_NAME] == employee.first_name
    assert row[LAST_NAME] == employee.last_name


@pytest.mark.crud
def test_employee_can_be_deleted(new_employee, employee_list_page):
    employee = new_employee()

    assert employee_list_page.delete_if_present(employee.first_name) is True
    expect(employee_list_page.toast).to_contain_text("Successfully Deleted")

    employee_list_page.open()
    assert employee_list_page.delete_if_present(employee.first_name) is False


def test_search_by_unused_id_returns_no_records(employee_list_page):
    employee_list_page.open().search_by_id("0999999")

    expect(employee_list_page.no_records_message).to_be_visible()
    expect(employee_list_page.rows).to_have_count(0)
    assert employee_list_page.record_count() == 0


def test_employee_list_reports_a_populated_directory(employee_list_page):
    employee_list_page.open()

    assert employee_list_page.record_count() > 0
    expect(employee_list_page.column_headers.nth(2)).to_contain_text("First (& Middle) Name")
