"""Leave module: report filters, date validation, and entitlement gating."""
import pytest
from playwright.sync_api import expect

from pages.leave_page import STATUS


def test_leave_list_shows_its_filters_and_columns(leave_list_page):
    leave_list_page.open()

    assert leave_list_page.filter_labels() == [
        "From Date",
        "To Date",
        "Show Leave with Status",
        "Leave Type",
        "Employee Name",
        "Sub Unit",
    ]
    expect(leave_list_page.column_headers.nth(1)).to_contain_text("Date")
    expect(leave_list_page.column_headers.nth(2)).to_contain_text("Employee Name")
    expect(leave_list_page.column_headers.nth(6)).to_contain_text("Status")


def test_leave_list_defaults_to_pending_approval(leave_list_page):
    leave_list_page.open()

    assert leave_list_page.selected_statuses() == ["Pending Approval"]


def test_to_date_before_from_date_is_rejected(leave_list_page):
    leave_list_page.open().set_date_range("2025-11-10", "2025-11-05")
    leave_list_page.search_button.click()

    expect(leave_list_page.field_errors).to_have_text(["To date should be after from date"])


def test_results_only_contain_the_selected_status(leave_list_page):
    leave_list_page.open().search()

    if leave_list_page.rows.count() == 0:
        pytest.skip("shared demo currently has no pending leave requests to assert on")

    statuses = leave_list_page.column(STATUS)
    assert all(status.startswith("Pending Approval") for status in statuses), statuses


def test_my_leave_list_defaults_to_all_statuses(my_leave_page):
    my_leave_page.open()

    assert sorted(my_leave_page.selected_statuses()) == [
        "Cancelled",
        "Pending Approval",
        "Rejected",
        "Scheduled",
        "Taken",
    ]


def test_admin_cannot_apply_without_an_entitlement(apply_leave_page):
    """The demo's Admin account holds no leave balance, so the form is withheld."""
    apply_leave_page.open()

    expect(apply_leave_page.no_balance_message).to_be_visible()
    assert not apply_leave_page.has_balance()
