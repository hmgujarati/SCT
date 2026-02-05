"""
Test Site Settings - Logo & Images, Social Links
Tests for new admin panel features:
1. Logo & Images tab - upload areas for Main Logo, Logo Dark, Hero Images, About Image, CTA Image, Donate Image
2. Social Links tab - Facebook, Instagram, Twitter, YouTube, LinkedIn, WhatsApp
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@admin.com"
ADMIN_PASSWORD = "admin@123"


class TestSiteSettingsAuth:
    """Test authentication for site settings"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["access_token"]
    
    def test_login_success(self, auth_token):
        """Verify admin login works"""
        assert auth_token is not None
        print(f"✓ Admin login successful, token obtained")


class TestSocialLinks:
    """Test Social Links functionality"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_public_settings_includes_social_links(self):
        """Public settings endpoint should include social_links"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "social_links" in data, "social_links not in public settings"
        print(f"✓ Public settings includes social_links: {data.get('social_links', {})}")
    
    def test_get_admin_settings_includes_social_links(self, auth_headers):
        """Admin settings endpoint should include social_links"""
        response = requests.get(f"{BASE_URL}/api/settings/admin", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "social_links" in data, "social_links not in admin settings"
        print(f"✓ Admin settings includes social_links")
    
    def test_update_social_links_facebook(self, auth_headers):
        """Test updating Facebook link"""
        test_url = "https://facebook.com/shivdhara-test"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"social_links": {"facebook": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["social_links"]["facebook"] == test_url
        print(f"✓ Facebook link updated successfully")
    
    def test_update_social_links_instagram(self, auth_headers):
        """Test updating Instagram link"""
        test_url = "https://instagram.com/shivdhara-test"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"social_links": {"instagram": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["social_links"]["instagram"] == test_url
        print(f"✓ Instagram link updated successfully")
    
    def test_update_social_links_twitter(self, auth_headers):
        """Test updating Twitter link"""
        test_url = "https://twitter.com/shivdhara-test"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"social_links": {"twitter": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["social_links"]["twitter"] == test_url
        print(f"✓ Twitter link updated successfully")
    
    def test_update_social_links_youtube(self, auth_headers):
        """Test updating YouTube link"""
        test_url = "https://youtube.com/shivdhara-test"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"social_links": {"youtube": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["social_links"]["youtube"] == test_url
        print(f"✓ YouTube link updated successfully")
    
    def test_update_social_links_linkedin(self, auth_headers):
        """Test updating LinkedIn link"""
        test_url = "https://linkedin.com/company/shivdhara-test"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"social_links": {"linkedin": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["social_links"]["linkedin"] == test_url
        print(f"✓ LinkedIn link updated successfully")
    
    def test_update_social_links_whatsapp(self, auth_headers):
        """Test updating WhatsApp link"""
        test_number = "+919876543210"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"social_links": {"whatsapp": test_number}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["social_links"]["whatsapp"] == test_number
        print(f"✓ WhatsApp link updated successfully")
    
    def test_update_all_social_links_at_once(self, auth_headers):
        """Test updating all social links in one request"""
        social_links = {
            "facebook": "https://facebook.com/shivdhara-all",
            "instagram": "https://instagram.com/shivdhara-all",
            "twitter": "https://twitter.com/shivdhara-all",
            "youtube": "https://youtube.com/shivdhara-all",
            "linkedin": "https://linkedin.com/company/shivdhara-all",
            "whatsapp": "+911234567890"
        }
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"social_links": social_links}
        )
        assert response.status_code == 200
        
        # Verify all updates
        verify = requests.get(f"{BASE_URL}/api/settings")
        for key, value in social_links.items():
            assert verify.json()["social_links"][key] == value, f"{key} not updated correctly"
        print(f"✓ All social links updated successfully in one request")
    
    def test_clear_social_link(self, auth_headers):
        """Test clearing a social link (empty string)"""
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"social_links": {"twitter": ""}}
        )
        assert response.status_code == 200
        
        # Verify cleared
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["social_links"]["twitter"] == ""
        print(f"✓ Social link cleared successfully")


class TestSiteImages:
    """Test Site Images (Logo & Images tab) functionality"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_public_settings_includes_site_images(self):
        """Public settings endpoint should include site_images"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "site_images" in data, "site_images not in public settings"
        print(f"✓ Public settings includes site_images: {list(data.get('site_images', {}).keys())}")
    
    def test_get_admin_settings_includes_site_images(self, auth_headers):
        """Admin settings endpoint should include site_images"""
        response = requests.get(f"{BASE_URL}/api/settings/admin", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "site_images" in data, "site_images not in admin settings"
        
        # Verify all expected image fields exist
        expected_fields = ["logo", "logo_dark", "hero_image", "hero_image_2", "about_image", "cta_image", "donate_image"]
        for field in expected_fields:
            assert field in data["site_images"], f"{field} not in site_images"
        print(f"✓ Admin settings includes all site_images fields: {expected_fields}")
    
    def test_update_logo_url(self, auth_headers):
        """Test updating main logo URL"""
        test_url = "/uploads/test-logo.png"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": {"logo": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["site_images"]["logo"] == test_url
        print(f"✓ Logo URL updated successfully")
    
    def test_update_logo_dark_url(self, auth_headers):
        """Test updating dark logo URL"""
        test_url = "/uploads/test-logo-dark.png"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": {"logo_dark": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["site_images"]["logo_dark"] == test_url
        print(f"✓ Logo Dark URL updated successfully")
    
    def test_update_hero_image_url(self, auth_headers):
        """Test updating hero image URL"""
        test_url = "/uploads/test-hero.jpg"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": {"hero_image": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["site_images"]["hero_image"] == test_url
        print(f"✓ Hero Image URL updated successfully")
    
    def test_update_hero_image_2_url(self, auth_headers):
        """Test updating hero image 2 URL"""
        test_url = "/uploads/test-hero-2.jpg"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": {"hero_image_2": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["site_images"]["hero_image_2"] == test_url
        print(f"✓ Hero Image 2 URL updated successfully")
    
    def test_update_about_image_url(self, auth_headers):
        """Test updating about page image URL"""
        test_url = "/uploads/test-about.jpg"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": {"about_image": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["site_images"]["about_image"] == test_url
        print(f"✓ About Image URL updated successfully")
    
    def test_update_cta_image_url(self, auth_headers):
        """Test updating CTA image URL"""
        test_url = "/uploads/test-cta.jpg"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": {"cta_image": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["site_images"]["cta_image"] == test_url
        print(f"✓ CTA Image URL updated successfully")
    
    def test_update_donate_image_url(self, auth_headers):
        """Test updating donate page image URL"""
        test_url = "/uploads/test-donate.jpg"
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": {"donate_image": test_url}}
        )
        assert response.status_code == 200
        
        # Verify update
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["site_images"]["donate_image"] == test_url
        print(f"✓ Donate Image URL updated successfully")
    
    def test_update_all_site_images_at_once(self, auth_headers):
        """Test updating all site images in one request"""
        site_images = {
            "logo": "/uploads/all-logo.png",
            "logo_dark": "/uploads/all-logo-dark.png",
            "hero_image": "/uploads/all-hero.jpg",
            "hero_image_2": "/uploads/all-hero-2.jpg",
            "about_image": "/uploads/all-about.jpg",
            "cta_image": "/uploads/all-cta.jpg",
            "donate_image": "/uploads/all-donate.jpg"
        }
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": site_images}
        )
        assert response.status_code == 200
        
        # Verify all updates
        verify = requests.get(f"{BASE_URL}/api/settings")
        for key, value in site_images.items():
            assert verify.json()["site_images"][key] == value, f"{key} not updated correctly"
        print(f"✓ All site images updated successfully in one request")
    
    def test_clear_site_image(self, auth_headers):
        """Test clearing a site image (empty string)"""
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": {"hero_image_2": ""}}
        )
        assert response.status_code == 200
        
        # Verify cleared
        verify = requests.get(f"{BASE_URL}/api/settings")
        assert verify.json()["site_images"]["hero_image_2"] == ""
        print(f"✓ Site image cleared successfully")


class TestFileUpload:
    """Test file upload functionality for images"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_upload_image_returns_url(self, auth_headers):
        """Test uploading an image returns a URL"""
        # Create a simple test image (1x1 red pixel PNG)
        import base64
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        )
        
        files = {"file": ("test.png", io.BytesIO(png_data), "image/png")}
        response = requests.post(f"{BASE_URL}/api/upload", headers=auth_headers, files=files)
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data, "Response should contain url"
        assert data["url"].startswith("/uploads/"), "URL should start with /uploads/"
        print(f"✓ Image upload successful, URL: {data['url']}")
    
    def test_upload_requires_auth(self):
        """Test that upload requires authentication"""
        import base64
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        )
        
        files = {"file": ("test.png", io.BytesIO(png_data), "image/png")}
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
        
        assert response.status_code in [401, 403], "Upload should require authentication"
        print(f"✓ Upload correctly requires authentication")
    
    def test_upload_rejects_non_image(self, auth_headers):
        """Test that upload rejects non-image files"""
        files = {"file": ("test.txt", io.BytesIO(b"Hello World"), "text/plain")}
        response = requests.post(f"{BASE_URL}/api/upload", headers=auth_headers, files=files)
        
        assert response.status_code == 400, "Should reject non-image files"
        print(f"✓ Upload correctly rejects non-image files")


class TestGalleryImageUpload:
    """Test gallery image upload with local file storage"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_upload_multiple_images(self, auth_headers):
        """Test uploading multiple images at once"""
        import base64
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        )
        
        files = [
            ("files", ("test1.png", io.BytesIO(png_data), "image/png")),
            ("files", ("test2.png", io.BytesIO(png_data), "image/png"))
        ]
        response = requests.post(f"{BASE_URL}/api/upload/multiple", headers=auth_headers, files=files)
        
        assert response.status_code == 200
        data = response.json()
        assert "uploaded" in data, "Response should contain uploaded array"
        assert len(data["uploaded"]) == 2, "Should have uploaded 2 images"
        print(f"✓ Multiple image upload successful, {len(data['uploaded'])} images uploaded")
    
    def test_create_gallery_album_with_images(self, auth_headers):
        """Test creating a gallery album with uploaded images"""
        # First upload an image
        import base64
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        )
        
        files = {"file": ("gallery-test.png", io.BytesIO(png_data), "image/png")}
        upload_response = requests.post(f"{BASE_URL}/api/upload", headers=auth_headers, files=files)
        assert upload_response.status_code == 200
        image_url = upload_response.json()["url"]
        
        # Create album with the uploaded image
        album_data = {
            "title": {"en": "TEST_Gallery Album", "gu": "TEST_ગેલેરી આલ્બમ"},
            "category": "education",
            "images": [
                {
                    "id": "test-img-1",
                    "url": image_url,
                    "caption": {"en": "Test caption", "gu": "ટેસ્ટ કેપ્શન"},
                    "order": 0
                }
            ],
            "is_active": True
        }
        
        response = requests.post(f"{BASE_URL}/api/gallery", headers=auth_headers, json=album_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data, "Response should contain album id"
        
        # Verify album was created with image
        album_id = data["id"]
        verify = requests.get(f"{BASE_URL}/api/gallery/{album_id}")
        assert verify.status_code == 200
        album = verify.json()
        assert len(album["images"]) == 1, "Album should have 1 image"
        assert album["images"][0]["url"] == image_url, "Image URL should match"
        
        # Cleanup - delete the test album
        requests.delete(f"{BASE_URL}/api/gallery/{album_id}", headers=auth_headers)
        print(f"✓ Gallery album created with uploaded image successfully")


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_reset_social_links(self, auth_headers):
        """Reset social links to empty"""
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"social_links": {
                "facebook": "",
                "instagram": "",
                "twitter": "",
                "youtube": "",
                "linkedin": "",
                "whatsapp": ""
            }}
        )
        assert response.status_code == 200
        print(f"✓ Social links reset to empty")
    
    def test_reset_site_images(self, auth_headers):
        """Reset site images to empty"""
        response = requests.put(f"{BASE_URL}/api/settings", 
            headers=auth_headers,
            json={"site_images": {
                "logo": "",
                "logo_dark": "",
                "hero_image": "",
                "hero_image_2": "",
                "about_image": "",
                "cta_image": "",
                "donate_image": ""
            }}
        )
        assert response.status_code == 200
        print(f"✓ Site images reset to empty")
