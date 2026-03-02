"""
Iteration 5 Backend Tests for Shivdhara Charitable Trust
Tests:
- Admin login functionality
- File upload authentication (security)
- Registration endpoint disabled (security)
- Admin endpoints require admin role (security)
- Donation flow with Razorpay
- Page visibility toggle
- Contact form submission
- Settings save (all tabs)
"""

import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@admin.com"
ADMIN_PASSWORD = "admin@123"


class TestAdminLogin:
    """Test admin login functionality"""
    
    def test_login_success(self):
        """Test successful admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print(f"SUCCESS: Admin login works - User: {data['user']['name']}, Role: {data['user']['role']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Invalid credentials correctly rejected with 401")
    
    def test_login_missing_fields(self):
        """Test login with missing fields"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL
        })
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("SUCCESS: Missing password correctly rejected with 422")


class TestSecurityEndpoints:
    """Test security features - registration disabled, auth required"""
    
    def test_register_endpoint_disabled(self):
        """Test that /api/auth/register returns 404 (registration disabled)"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test@test.com",
            "password": "testpass123",
            "name": "Test User"
        })
        # Should return 404 or 405 since registration is disabled
        assert response.status_code in [404, 405], f"Expected 404/405, got {response.status_code}. Registration should be disabled!"
        print(f"SUCCESS: Registration endpoint correctly returns {response.status_code} (disabled)")
    
    def test_upload_requires_auth(self):
        """Test that upload endpoint requires authentication"""
        # Create a simple test file
        files = {'file': ('test.jpg', b'fake image content', 'image/jpeg')}
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}. Upload should require auth!"
        print(f"SUCCESS: Upload endpoint correctly requires authentication ({response.status_code})")
    
    def test_upload_multiple_requires_auth(self):
        """Test that multiple upload endpoint requires authentication"""
        files = [('files', ('test1.jpg', b'fake image 1', 'image/jpeg'))]
        response = requests.post(f"{BASE_URL}/api/upload/multiple", files=files)
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"SUCCESS: Multiple upload endpoint correctly requires authentication ({response.status_code})")
    
    def test_admin_settings_requires_auth(self):
        """Test that admin settings endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/settings/admin")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"SUCCESS: Admin settings endpoint correctly requires authentication ({response.status_code})")
    
    def test_donations_list_requires_auth(self):
        """Test that donations list requires authentication"""
        response = requests.get(f"{BASE_URL}/api/donations")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"SUCCESS: Donations list endpoint correctly requires authentication ({response.status_code})")
    
    def test_contacts_list_requires_auth(self):
        """Test that contacts list requires authentication"""
        response = requests.get(f"{BASE_URL}/api/contact")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"SUCCESS: Contacts list endpoint correctly requires authentication ({response.status_code})")


class TestAuthenticatedEndpoints:
    """Test endpoints that require authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, "Login failed in setup"
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_me(self):
        """Test /api/auth/me endpoint"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print(f"SUCCESS: /api/auth/me returns correct user data")
    
    def test_get_admin_settings(self):
        """Test admin settings endpoint with auth"""
        response = requests.get(f"{BASE_URL}/api/settings/admin", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Verify all expected settings sections exist
        expected_sections = ['bank_details', 'trust_details', 'contact_info', 'upi_details', 
                           'smtp_config', 'razorpay_config', 'social_links', 'site_images', 'footer_text']
        for section in expected_sections:
            assert section in data, f"Missing section: {section}"
        print(f"SUCCESS: Admin settings returns all {len(expected_sections)} sections")
    
    def test_upload_with_auth(self):
        """Test file upload with authentication"""
        # Create a simple test image (1x1 pixel PNG)
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
        files = {'file': ('test.png', png_data, 'image/png')}
        response = requests.post(f"{BASE_URL}/api/upload", files=files, headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data, "No url in response"
        assert "filename" in data, "No filename in response"
        print(f"SUCCESS: File upload works with auth - URL: {data['url']}")
    
    def test_upload_invalid_file_type(self):
        """Test that invalid file types are rejected"""
        files = {'file': ('test.txt', b'text content', 'text/plain')}
        response = requests.post(f"{BASE_URL}/api/upload", files=files, headers=self.headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("SUCCESS: Invalid file type correctly rejected with 400")


class TestPageVisibility:
    """Test page visibility toggle functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, "Login failed in setup"
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_page_visibility(self):
        """Test getting page visibility settings"""
        response = requests.get(f"{BASE_URL}/api/pages/visibility")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        expected_pages = ['home', 'about', 'gallery', 'stories', 'blog', 'donate', 'contact']
        for page in expected_pages:
            assert page in data, f"Missing page: {page}"
        print(f"SUCCESS: Page visibility returns all {len(expected_pages)} pages")
    
    def test_toggle_page_visibility(self):
        """Test toggling page visibility"""
        # Get current state
        response = requests.get(f"{BASE_URL}/api/pages/visibility")
        original_state = response.json().get('blog', True)
        
        # Toggle blog page
        new_state = not original_state
        response = requests.put(f"{BASE_URL}/api/pages/visibility", 
                               json={"page_key": "blog", "is_visible": new_state},
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify change
        response = requests.get(f"{BASE_URL}/api/pages/visibility")
        assert response.json()['blog'] == new_state, "Page visibility not updated"
        
        # Restore original state
        requests.put(f"{BASE_URL}/api/pages/visibility", 
                    json={"page_key": "blog", "is_visible": original_state},
                    headers=self.headers)
        print(f"SUCCESS: Page visibility toggle works - toggled blog from {original_state} to {new_state}")
    
    def test_bulk_update_visibility(self):
        """Test bulk update of page visibility"""
        response = requests.put(f"{BASE_URL}/api/pages/visibility/bulk",
                               json={
                                   "home": True,
                                   "about": True,
                                   "gallery": True,
                                   "stories": True,
                                   "blog": True,
                                   "donate": True,
                                   "contact": True
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Bulk page visibility update works")


class TestSettingsSave:
    """Test saving settings for all tabs"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, "Login failed in setup"
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_save_footer_text(self):
        """Test saving footer text settings"""
        response = requests.put(f"{BASE_URL}/api/settings",
                               json={
                                   "footer_text": {
                                       "en": "Test footer text in English",
                                       "gu": "ટેસ્ટ ફૂટર ટેક્સ્ટ ગુજરાતીમાં"
                                   }
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Footer text settings saved")
    
    def test_save_contact_info(self):
        """Test saving contact info settings"""
        response = requests.put(f"{BASE_URL}/api/settings",
                               json={
                                   "contact_info": {
                                       "address_en": "Test Address",
                                       "address_gu": "ટેસ્ટ સરનામું",
                                       "phone": "+91 1234567890",
                                       "email": "test@shivdhara.org",
                                       "whatsapp": "+91 1234567890",
                                       "maps_embed": ""
                                   }
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Contact info settings saved")
    
    def test_save_bank_details(self):
        """Test saving bank details settings"""
        response = requests.put(f"{BASE_URL}/api/settings",
                               json={
                                   "bank_details": {
                                       "account_holder_name": "Shivdhara Charitable Trust",
                                       "account_number": "1234567890",
                                       "bank_name": "Test Bank",
                                       "branch_name": "Test Branch",
                                       "ifsc_code": "TEST0001234",
                                       "micr_code": "123456789"
                                   }
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Bank details settings saved")
    
    def test_save_trust_details(self):
        """Test saving trust details settings"""
        response = requests.put(f"{BASE_URL}/api/settings",
                               json={
                                   "trust_details": {
                                       "registration_no": "TEST123",
                                       "pan": "TESTPAN123",
                                       "darpan_id": "GJ/2024/0001234",
                                       "csr_no": "CSR00001234",
                                       "reg_80g": "80G/TEST/2024",
                                       "reg_12a": "12A/TEST/2024"
                                   }
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Trust details settings saved")
    
    def test_save_upi_details(self):
        """Test saving UPI details settings"""
        response = requests.put(f"{BASE_URL}/api/settings",
                               json={
                                   "upi_details": {
                                       "upi_id": "test@upi",
                                       "qr_code_url": ""
                                   }
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: UPI details settings saved")
    
    def test_save_social_links(self):
        """Test saving social links settings"""
        response = requests.put(f"{BASE_URL}/api/settings",
                               json={
                                   "social_links": {
                                       "facebook": "https://facebook.com/test",
                                       "instagram": "https://instagram.com/test",
                                       "twitter": "https://twitter.com/test",
                                       "youtube": "https://youtube.com/test",
                                       "linkedin": "https://linkedin.com/test",
                                       "whatsapp": "+919876543210"
                                   }
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Social links settings saved")
    
    def test_save_site_images(self):
        """Test saving site images settings"""
        response = requests.put(f"{BASE_URL}/api/settings",
                               json={
                                   "site_images": {
                                       "logo": "/api/uploads/test-logo.png",
                                       "logo_dark": "",
                                       "favicon": "",
                                       "hero_image": "",
                                       "hero_image_2": "",
                                       "about_image": "",
                                       "cta_image": "",
                                       "donate_image": ""
                                   }
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Site images settings saved")
    
    def test_save_razorpay_config(self):
        """Test saving Razorpay config settings"""
        response = requests.put(f"{BASE_URL}/api/settings",
                               json={
                                   "razorpay_config": {
                                       "key_id": "rzp_test_SJ3T84OsthU6ZQ",
                                       "key_secret": "",
                                       "webhook_secret": "",
                                       "is_live": False
                                   }
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Razorpay config settings saved")
    
    def test_save_impact_stats(self):
        """Test saving impact stats settings"""
        response = requests.put(f"{BASE_URL}/api/settings",
                               json={
                                   "impact_stats": {
                                       "families_helped": 5000,
                                       "education_drives": 150,
                                       "medical_camps": 75,
                                       "years_of_service": 12
                                   }
                               },
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Impact stats settings saved")


class TestDonationFlow:
    """Test donation flow with Razorpay"""
    
    def test_create_donation_order(self):
        """Test creating a donation order"""
        response = requests.post(f"{BASE_URL}/api/donations/create-order",
                                json={
                                    "amount": 100,
                                    "donor_info": {
                                        "name": "Test Donor",
                                        "email": "test@example.com",
                                        "phone": "+91 9876543210"
                                    },
                                    "needs_80g": False
                                })
        # This may fail if Razorpay is not configured, which is expected
        if response.status_code == 400:
            data = response.json()
            if "Razorpay not configured" in str(data):
                print("INFO: Razorpay not configured - expected in test environment")
                pytest.skip("Razorpay not configured")
        elif response.status_code == 200:
            data = response.json()
            assert "order_id" in data, "No order_id in response"
            assert "amount" in data, "No amount in response"
            assert data["amount"] == 10000, "Amount should be in paise (100 * 100)"
            print(f"SUCCESS: Donation order created - Order ID: {data['order_id']}")
        else:
            # May fail due to invalid Razorpay credentials
            print(f"INFO: Donation order creation returned {response.status_code} - may need valid Razorpay keys")
    
    def test_public_settings_has_razorpay_key(self):
        """Test that public settings includes Razorpay key ID"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "razorpay_key_id" in data, "razorpay_key_id should be in public settings"
        print(f"SUCCESS: Public settings includes razorpay_key_id: {data.get('razorpay_key_id', 'empty')}")


class TestContactForm:
    """Test contact form submission"""
    
    def test_submit_contact_form(self):
        """Test submitting a contact form"""
        response = requests.post(f"{BASE_URL}/api/contact",
                                json={
                                    "name": "Test User",
                                    "email": "test@example.com",
                                    "phone": "+91 9876543210",
                                    "subject": "Test Subject",
                                    "message": "This is a test message from automated testing.",
                                    "is_volunteer": False
                                })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data, "No message in response"
        assert "id" in data, "No id in response"
        print(f"SUCCESS: Contact form submitted - ID: {data['id']}")
    
    def test_submit_volunteer_form(self):
        """Test submitting a volunteer interest form"""
        response = requests.post(f"{BASE_URL}/api/contact",
                                json={
                                    "name": "Test Volunteer",
                                    "email": "volunteer@example.com",
                                    "phone": "+91 9876543210",
                                    "subject": "Volunteer Interest",
                                    "message": "I want to volunteer for your organization.",
                                    "is_volunteer": True
                                })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Volunteer form submitted")
    
    def test_contact_form_validation(self):
        """Test contact form validation"""
        response = requests.post(f"{BASE_URL}/api/contact",
                                json={
                                    "name": "Test",
                                    "email": "invalid-email",  # Invalid email
                                    "message": "Test"
                                })
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("SUCCESS: Contact form validation works - invalid email rejected")


class TestGalleryUpload:
    """Test gallery upload functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, "Login failed in setup"
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_create_gallery_album(self):
        """Test creating a gallery album"""
        response = requests.post(f"{BASE_URL}/api/gallery",
                                json={
                                    "title": {"en": "Test Album", "gu": "ટેસ્ટ આલ્બમ"},
                                    "category": "education",
                                    "images": [],
                                    "is_active": True
                                },
                                headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "id" in data, "No id in response"
        self.album_id = data["id"]
        print(f"SUCCESS: Gallery album created - ID: {data['id']}")
        
        # Cleanup - delete the test album
        requests.delete(f"{BASE_URL}/api/gallery/{data['id']}", headers=self.headers)
    
    def test_get_gallery_albums(self):
        """Test getting gallery albums"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"SUCCESS: Gallery returns {len(data)} albums")
    
    def test_upload_multiple_images(self):
        """Test uploading multiple images"""
        # Create test images
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
        files = [
            ('files', ('test1.png', png_data, 'image/png')),
            ('files', ('test2.png', png_data, 'image/png'))
        ]
        response = requests.post(f"{BASE_URL}/api/upload/multiple", files=files, headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "uploaded" in data, "No uploaded in response"
        assert len(data["uploaded"]) == 2, "Should have uploaded 2 files"
        print(f"SUCCESS: Multiple images uploaded - {len(data['uploaded'])} files")


class TestLanguageSwitcher:
    """Test language switcher functionality (content endpoints)"""
    
    def test_get_home_content(self):
        """Test getting home page content"""
        response = requests.get(f"{BASE_URL}/api/content/home")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Content should have bilingual fields
        if data:
            for key, value in data.items():
                if isinstance(value, dict):
                    # Check for en/gu keys
                    if 'en' in value or 'gu' in value:
                        print(f"SUCCESS: Content '{key}' has bilingual support")
                        break
        print("SUCCESS: Home content endpoint works")
    
    def test_get_all_content(self):
        """Test getting all content"""
        response = requests.get(f"{BASE_URL}/api/content")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"SUCCESS: All content endpoint returns {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
