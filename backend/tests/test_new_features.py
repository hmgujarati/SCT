"""
Backend API Tests for New Features:
- Admin Login with new credentials (admin@admin.com / admin@123)
- File Upload API (POST /api/upload)
- Page Visibility API (GET/PUT /api/pages/visibility)
"""
import pytest
import requests
import os
import uuid
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mental-care-trust.preview.emergentagent.com').rstrip('/')

# New admin credentials
NEW_ADMIN_EMAIL = "admin@admin.com"
NEW_ADMIN_PASSWORD = "admin@123"


class TestNewAdminLogin:
    """Test admin login with new credentials"""
    
    def test_admin_login_new_credentials(self):
        """Test admin login with admin@admin.com / admin@123"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": NEW_ADMIN_EMAIL,
            "password": NEW_ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == NEW_ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert data["user"]["name"] == "Harsh Gujarati"
        print(f"✓ Admin login successful with new credentials - User: {data['user']['name']}")


@pytest.fixture
def auth_token():
    """Get admin auth token with new credentials"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": NEW_ADMIN_EMAIL,
        "password": NEW_ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Authentication failed")


@pytest.fixture
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


class TestFileUploadAPI:
    """Test file upload functionality"""
    
    def test_upload_single_file(self, auth_token):
        """Test uploading a single image file"""
        # Create a simple PNG file in memory
        png_header = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'file': ('test_image.png', io.BytesIO(png_header), 'image/png')}
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, headers=headers)
        assert response.status_code == 200, f"Upload failed: {response.text}"
        data = response.json()
        assert "url" in data
        assert "filename" in data
        assert data["url"].startswith("/uploads/")
        assert data["url"].endswith(".png")
        print(f"✓ Single file upload successful - URL: {data['url']}")
    
    def test_upload_multiple_files(self, auth_token):
        """Test uploading multiple image files"""
        # Create simple PNG files in memory
        png_header = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = [
            ('files', ('test1.png', io.BytesIO(png_header), 'image/png')),
            ('files', ('test2.png', io.BytesIO(png_header), 'image/png'))
        ]
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(f"{BASE_URL}/api/upload/multiple", files=files, headers=headers)
        assert response.status_code == 200, f"Multiple upload failed: {response.text}"
        data = response.json()
        assert "uploaded" in data
        assert len(data["uploaded"]) == 2
        for item in data["uploaded"]:
            assert "url" in item
            assert "filename" in item
        print(f"✓ Multiple file upload successful - {len(data['uploaded'])} files uploaded")
    
    def test_upload_invalid_file_type(self, auth_token):
        """Test uploading invalid file type (should fail)"""
        files = {'file': ('test.txt', io.BytesIO(b'Hello World'), 'text/plain')}
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, headers=headers)
        assert response.status_code == 400, "Should reject non-image files"
        print("✓ Invalid file type correctly rejected")
    
    def test_upload_without_auth(self):
        """Test uploading without authentication (should fail)"""
        png_header = b'\x89PNG\r\n\x1a\n'
        files = {'file': ('test.png', io.BytesIO(png_header), 'image/png')}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
        assert response.status_code in [401, 403], "Should require authentication"
        print("✓ Upload without auth correctly rejected")


class TestPageVisibilityAPI:
    """Test page visibility functionality"""
    
    def test_get_page_visibility(self):
        """Test fetching page visibility settings (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/pages/visibility")
        assert response.status_code == 200
        data = response.json()
        
        # Check all 7 pages are present
        expected_pages = ['home', 'about', 'gallery', 'stories', 'blog', 'donate', 'contact']
        for page in expected_pages:
            assert page in data, f"Missing page: {page}"
            assert isinstance(data[page], bool), f"Page {page} should be boolean"
        
        print(f"✓ Page visibility fetched - All 7 pages present")
        print(f"  Visibility: {data}")
    
    def test_toggle_page_visibility(self, auth_headers):
        """Test toggling page visibility"""
        # First get current state
        get_response = requests.get(f"{BASE_URL}/api/pages/visibility")
        original_state = get_response.json().get('gallery', True)
        
        # Toggle gallery page
        new_state = not original_state
        response = requests.put(
            f"{BASE_URL}/api/pages/visibility",
            json={"page_key": "gallery", "is_visible": new_state},
            headers=auth_headers
        )
        assert response.status_code == 200
        print(f"✓ Toggled gallery visibility to {new_state}")
        
        # Verify the change
        verify_response = requests.get(f"{BASE_URL}/api/pages/visibility")
        assert verify_response.json()['gallery'] == new_state
        print(f"✓ Verified gallery visibility is now {new_state}")
        
        # Restore original state
        requests.put(
            f"{BASE_URL}/api/pages/visibility",
            json={"page_key": "gallery", "is_visible": original_state},
            headers=auth_headers
        )
        print(f"✓ Restored gallery visibility to {original_state}")
    
    def test_toggle_all_pages(self, auth_headers):
        """Test toggling each page visibility"""
        pages = ['home', 'about', 'gallery', 'stories', 'blog', 'donate', 'contact']
        
        for page in pages:
            # Toggle off
            response = requests.put(
                f"{BASE_URL}/api/pages/visibility",
                json={"page_key": page, "is_visible": False},
                headers=auth_headers
            )
            assert response.status_code == 200, f"Failed to toggle {page} off"
            
            # Toggle back on
            response = requests.put(
                f"{BASE_URL}/api/pages/visibility",
                json={"page_key": page, "is_visible": True},
                headers=auth_headers
            )
            assert response.status_code == 200, f"Failed to toggle {page} on"
        
        print(f"✓ Successfully toggled all 7 pages")
    
    def test_bulk_update_visibility(self, auth_headers):
        """Test bulk update of page visibility"""
        visibility_data = {
            "home": True,
            "about": True,
            "gallery": True,
            "stories": True,
            "blog": True,
            "donate": True,
            "contact": True
        }
        
        response = requests.put(
            f"{BASE_URL}/api/pages/visibility/bulk",
            json=visibility_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        print("✓ Bulk visibility update successful")
    
    def test_toggle_without_auth(self):
        """Test toggling visibility without authentication (should fail)"""
        response = requests.put(
            f"{BASE_URL}/api/pages/visibility",
            json={"page_key": "gallery", "is_visible": False}
        )
        assert response.status_code in [401, 403], "Should require authentication"
        print("✓ Toggle without auth correctly rejected")


class TestGalleryWithUpload:
    """Test gallery album creation with uploaded images"""
    
    def test_create_album_with_uploaded_images(self, auth_token, auth_headers):
        """Test creating a gallery album with uploaded images"""
        # First upload an image
        png_header = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
        files = {'file': ('test_gallery.png', io.BytesIO(png_header), 'image/png')}
        upload_headers = {"Authorization": f"Bearer {auth_token}"}
        
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, headers=upload_headers)
        assert upload_response.status_code == 200
        uploaded_url = upload_response.json()["url"]
        print(f"✓ Uploaded image: {uploaded_url}")
        
        # Create album with the uploaded image
        album_data = {
            "title": {
                "en": f"TEST_Upload_Album_{uuid.uuid4().hex[:8]}",
                "gu": "ટેસ્ટ અપલોડ આલ્બમ"
            },
            "category": "education",
            "images": [
                {
                    "id": str(uuid.uuid4()),
                    "url": f"{BASE_URL}{uploaded_url}",
                    "caption": {"en": "Test uploaded image", "gu": "ટેસ્ટ અપલોડ ફોટો"},
                    "order": 0
                }
            ],
            "is_active": True
        }
        
        response = requests.post(f"{BASE_URL}/api/gallery", json=album_data, headers=auth_headers)
        assert response.status_code == 200
        album_id = response.json()["id"]
        print(f"✓ Created album with uploaded image - ID: {album_id}")
        
        # Verify album has the image
        get_response = requests.get(f"{BASE_URL}/api/gallery/{album_id}")
        assert get_response.status_code == 200
        album = get_response.json()
        assert len(album["images"]) == 1
        print(f"✓ Verified album has 1 image")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gallery/{album_id}", headers=auth_headers)
        print(f"✓ Cleaned up test album")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
