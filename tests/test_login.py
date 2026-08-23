"""Authentication: valid login, rejected credentials, and session boundaries."""
import re

import pytest
from playwright.sync_api import expect

import config

LOGIN_URL = re.compile(r"/auth/login")


@pytest.mark.anonymous
def test_valid_login_lands_on_dashboard(login_page, dashboard_page):
    login_page.open().login_and_wait(config.USERNAME, config.PASSWORD)

    expect(dashboard_page.breadcrumb).to_contain_text("Dashboard")
    expect(dashboard_page.user_dropdown).to_be_visible()


@pytest.mark.anonymous
def test_wrong_password_is_rejected(login_page):
    login_page.open().login(config.USERNAME, "definitely-not-the-password")

    expect(login_page.alert).to_have_text("Invalid credentials")
    expect(login_page.page).to_have_url(LOGIN_URL)


@pytest.mark.anonymous
def test_unknown_username_is_rejected(login_page):
    login_page.open().login("no-such-user", config.PASSWORD)

    expect(login_page.alert).to_have_text("Invalid credentials")


@pytest.mark.anonymous
def test_empty_credentials_show_required_validation(login_page):
    login_page.open().submit_button.click()

    expect(login_page.field_errors).to_have_count(2)
    expect(login_page.field_errors.first).to_have_text("Required")
    expect(login_page.alert).to_have_count(0)


@pytest.mark.anonymous
def test_dashboard_requires_authentication(dashboard_page):
    """An anonymous request for a protected page is bounced to the login form."""
    dashboard_page.open()

    expect(dashboard_page.page).to_have_url(LOGIN_URL)


def test_logout_ends_the_session(dashboard_page, login_page):
    dashboard_page.open().logout()

    expect(login_page.username).to_be_visible()

    dashboard_page.open()
    expect(dashboard_page.page).to_have_url(LOGIN_URL)
