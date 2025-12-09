#!/usr/bin/env python3
"""
Honeypot Backend API Testing Suite
Tests all honeypot endpoints including attack detection, admin authentication, and dashboard APIs
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

# Use the public endpoint from frontend .env
BACKEND_URL = "https://honeytrap-1.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class HoneypotAPITester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")

    def test_honeypot_login_basic(self):
        """Test basic honeypot login functionality"""
        try:
            response = requests.post(f"{API_BASE}/honeypot/login", 
                json={"username": "admin", "password": "password123"},
                timeout=10)
            
            success = (response.status_code == 200 and 
                      response.json().get("success") == False and
                      "Invalid credentials" in response.json().get("message", ""))
            
            details = f"Status: {response.status_code}, Response: {response.json()}"
            self.log_test("Honeypot Login - Basic", success, details)
            return success
        except Exception as e:
            self.log_test("Honeypot Login - Basic", False, f"Error: {str(e)}")
            return False

    def test_sql_injection_detection(self):
        """Test SQL injection attack detection"""
        try:
            sql_payload = "admin' OR '1'='1"
            response = requests.post(f"{API_BASE}/honeypot/login",
                json={"username": sql_payload, "password": "password"},
                timeout=10)
            
            success = response.status_code == 200
            details = f"SQL injection payload sent, Status: {response.status_code}"
            self.log_test("SQL Injection Detection", success, details)
            return success
        except Exception as e:
            self.log_test("SQL Injection Detection", False, f"Error: {str(e)}")
            return False

    def test_xss_detection(self):
        """Test XSS attack detection"""
        try:
            xss_payload = "<script>alert('xss')</script>"
            response = requests.post(f"{API_BASE}/honeypot/login",
                json={"username": "user", "password": xss_payload},
                timeout=10)
            
            success = response.status_code == 200
            details = f"XSS payload sent, Status: {response.status_code}"
            self.log_test("XSS Detection", success, details)
            return success
        except Exception as e:
            self.log_test("XSS Detection", False, f"Error: {str(e)}")
            return False

    def test_admin_login_success(self):
        """Test admin login with correct password"""
        try:
            response = requests.post(f"{API_BASE}/admin/login",
                json={"password": "honeyadmin123"},
                timeout=10)
            
            success = (response.status_code == 200 and 
                      response.json().get("success") == True and
                      "token" in response.json())
            
            if success:
                self.admin_token = response.json().get("token")
            
            details = f"Status: {response.status_code}, Has token: {'token' in response.json()}"
            self.log_test("Admin Login - Success", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Login - Success", False, f"Error: {str(e)}")
            return False

    def test_admin_login_failure(self):
        """Test admin login with wrong password"""
        try:
            response = requests.post(f"{API_BASE}/admin/login",
                json={"password": "wrongpassword"},
                timeout=10)
            
            success = response.status_code == 401
            details = f"Status: {response.status_code} (expected 401)"
            self.log_test("Admin Login - Failure", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Login - Failure", False, f"Error: {str(e)}")
            return False

    def test_attack_stats_api(self):
        """Test attack statistics API"""
        try:
            response = requests.get(f"{API_BASE}/attacks/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_attacks", "unique_ips", "attack_types", "severity_breakdown"]
                has_required = all(field in data for field in required_fields)
                success = has_required
                details = f"Status: {response.status_code}, Has required fields: {has_required}"
            else:
                success = False
                details = f"Status: {response.status_code}"
            
            self.log_test("Attack Stats API", success, details)
            return success
        except Exception as e:
            self.log_test("Attack Stats API", False, f"Error: {str(e)}")
            return False

    def test_attack_timeline_api(self):
        """Test attack timeline API"""
        try:
            response = requests.get(f"{API_BASE}/attacks/timeline", timeout=10)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Timeline entries: {len(data)}"
            
            self.log_test("Attack Timeline API", success, details)
            return success
        except Exception as e:
            self.log_test("Attack Timeline API", False, f"Error: {str(e)}")
            return False

    def test_live_attacks_api(self):
        """Test live attacks API"""
        try:
            response = requests.get(f"{API_BASE}/attacks/live?limit=5", timeout=10)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Live attacks: {len(data)}"
            
            self.log_test("Live Attacks API", success, details)
            return success
        except Exception as e:
            self.log_test("Live Attacks API", False, f"Error: {str(e)}")
            return False

    def test_clear_attacks_api(self):
        """Test clear attacks API"""
        try:
            response = requests.delete(f"{API_BASE}/attacks", timeout=10)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Deleted: {data.get('deleted', 0)} records"
            
            self.log_test("Clear Attacks API", success, details)
            return success
        except Exception as e:
            self.log_test("Clear Attacks API", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🔍 Starting Honeypot Backend API Tests...")
        print(f"🎯 Testing against: {API_BASE}")
        print("=" * 60)

        # Test honeypot functionality
        self.test_honeypot_login_basic()
        self.test_sql_injection_detection()
        self.test_xss_detection()

        # Test admin authentication
        self.test_admin_login_failure()
        self.test_admin_login_success()

        # Test dashboard APIs
        self.test_attack_stats_api()
        self.test_attack_timeline_api()
        self.test_live_attacks_api()
        
        # Test clear functionality (run last)
        self.test_clear_attacks_api()

        # Print summary
        print("=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed!")
            return True
        else:
            print("⚠️  Some backend tests failed!")
            return False

def main():
    """Main test execution"""
    tester = HoneypotAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/backend_test_results.json", "w") as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())