"""
Backend API Tests for Shivdhara Charitable Trust Admin Panel
Tests: Auth, Content, Gallery, Stories, Blog, Settings, Donations, Contact
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://care-foundation-1.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@shivdhara.org"
ADMIN_PASSWORD = "Admin123!"


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful - User: {data['user']['name']}")
    
    def test_admin_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_auth_me_endpoint(self):
        """Test /auth/me endpoint with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Test /auth/me
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ Auth/me endpoint working - Role: {data['role']}")


@pytest.fixture
def auth_token():
    """Get admin auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
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


class TestContentAPI:
    """Page content CRUD tests"""
    
    def test_get_all_content(self, auth_headers):
        """Test fetching all page content"""
        response = requests.get(f"{BASE_URL}/api/content", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Fetched {len(data)} content items")
    
    def test_get_page_content(self, auth_headers):
        """Test fetching content for specific page"""
        response = requests.get(f"{BASE_URL}/api/content/home", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Home page content has {len(data)} sections")
    
    def test_update_content(self, auth_headers):
        """Test updating page content"""
        test_content = {
            "en": f"Test Content EN {uuid.uuid4().hex[:8]}",
            "gu": f"Test Content GU {uuid.uuid4().hex[:8]}"
        }
        response = requests.put(
            f"{BASE_URL}/api/content/home/hero_title",
            json=test_content,
            headers=auth_headers
        )
        assert response.status_code == 200
        print("✓ Content update successful")
        
        # Verify update
        verify_response = requests.get(f"{BASE_URL}/api/content/home", headers=auth_headers)
        assert verify_response.status_code == 200


class TestGalleryAPI:
    """Gallery album CRUD tests"""
    
    def test_get_all_gallery_albums(self, auth_headers):
        """Test fetching all gallery albums (admin)"""
        response = requests.get(f"{BASE_URL}/api/gallery/all", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Fetched {len(data)} gallery albums")
    
    def test_get_public_gallery(self):
        """Test fetching public gallery (no auth)"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public gallery has {len(data)} active albums")
    
    def test_create_gallery_album(self, auth_headers):
        """Test creating a new gallery album"""
        album_data = {
            "title": {
                "en": f"TEST_Album_{uuid.uuid4().hex[:8]}",
                "gu": "ટેસ્ટ આલ્બમ"
            },
            "category": "education",
            "images": [],
            "is_active": True
        }
        response = requests.post(f"{BASE_URL}/api/gallery", json=album_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Created gallery album with ID: {data['id']}")
        return data["id"]
    
    def test_update_gallery_album(self, auth_headers):
        """Test updating a gallery album"""
        # First create an album
        album_data = {
            "title": {"en": f"TEST_Update_{uuid.uuid4().hex[:8]}", "gu": "અપડેટ ટેસ્ટ"},
            "category": "health",
            "images": [],
            "is_active": True
        }
        create_response = requests.post(f"{BASE_URL}/api/gallery", json=album_data, headers=auth_headers)
        album_id = create_response.json()["id"]
        
        # Update the album
        updated_data = {
            "title": {"en": "Updated Title", "gu": "અપડેટ થયેલ શીર્ષક"},
            "category": "relief",
            "images": [],
            "is_active": False
        }
        response = requests.put(f"{BASE_URL}/api/gallery/{album_id}", json=updated_data, headers=auth_headers)
        assert response.status_code == 200
        print(f"✓ Updated gallery album {album_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gallery/{album_id}", headers=auth_headers)
    
    def test_delete_gallery_album(self, auth_headers):
        """Test deleting a gallery album"""
        # First create an album
        album_data = {
            "title": {"en": f"TEST_Delete_{uuid.uuid4().hex[:8]}", "gu": "ડિલીટ ટેસ્ટ"},
            "category": "community",
            "images": [],
            "is_active": True
        }
        create_response = requests.post(f"{BASE_URL}/api/gallery", json=album_data, headers=auth_headers)
        album_id = create_response.json()["id"]
        
        # Delete the album
        response = requests.delete(f"{BASE_URL}/api/gallery/{album_id}", headers=auth_headers)
        assert response.status_code == 200
        print(f"✓ Deleted gallery album {album_id}")


class TestStoriesAPI:
    """Success stories CRUD tests"""
    
    def test_get_all_stories(self, auth_headers):
        """Test fetching all stories (admin)"""
        response = requests.get(f"{BASE_URL}/api/stories/all", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Fetched {len(data)} stories")
    
    def test_get_public_stories(self):
        """Test fetching public stories (no auth)"""
        response = requests.get(f"{BASE_URL}/api/stories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public stories: {len(data)} active")
    
    def test_create_story(self, auth_headers):
        """Test creating a new success story"""
        story_data = {
            "title": {"en": f"TEST_Story_{uuid.uuid4().hex[:8]}", "gu": "ટેસ્ટ વાર્તા"},
            "person_name": {"en": "Test Person", "gu": "ટેસ્ટ વ્યક્તિ"},
            "location": {"en": "Test Location", "gu": "ટેસ્ટ સ્થાન"},
            "problem": {"en": "Test problem description", "gu": "ટેસ્ટ સમસ્યા"},
            "help_provided": {"en": "Test help provided", "gu": "ટેસ્ટ મદદ"},
            "impact": {"en": "Test impact", "gu": "ટેસ્ટ પ્રભાવ"},
            "quote": {"en": "Test quote", "gu": "ટેસ્ટ અવતરણ"},
            "image_url": "",
            "category": "education",
            "is_active": True,
            "order": 0
        }
        response = requests.post(f"{BASE_URL}/api/stories", json=story_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Created story with ID: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/stories/{data['id']}", headers=auth_headers)
    
    def test_update_story(self, auth_headers):
        """Test updating a success story"""
        # Create story first
        story_data = {
            "title": {"en": f"TEST_Update_{uuid.uuid4().hex[:8]}", "gu": "અપડેટ ટેસ્ટ"},
            "person_name": {"en": "Original Name", "gu": "મૂળ નામ"},
            "location": {"en": "Location", "gu": "સ્થાન"},
            "problem": {"en": "Problem", "gu": "સમસ્યા"},
            "help_provided": {"en": "Help", "gu": "મદદ"},
            "impact": {"en": "Impact", "gu": "પ્રભાવ"},
            "quote": {"en": "Quote", "gu": "અવતરણ"},
            "image_url": "",
            "category": "health",
            "is_active": True,
            "order": 0
        }
        create_response = requests.post(f"{BASE_URL}/api/stories", json=story_data, headers=auth_headers)
        story_id = create_response.json()["id"]
        
        # Update
        story_data["person_name"]["en"] = "Updated Name"
        response = requests.put(f"{BASE_URL}/api/stories/{story_id}", json=story_data, headers=auth_headers)
        assert response.status_code == 200
        print(f"✓ Updated story {story_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/stories/{story_id}", headers=auth_headers)


class TestBlogAPI:
    """Blog posts CRUD tests"""
    
    def test_get_all_blog_posts(self, auth_headers):
        """Test fetching all blog posts (admin)"""
        response = requests.get(f"{BASE_URL}/api/blog/all", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Fetched {len(data)} blog posts")
    
    def test_get_public_blog_posts(self):
        """Test fetching public blog posts (no auth)"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public blog posts: {len(data)} published")
    
    def test_create_blog_post(self, auth_headers):
        """Test creating a new blog post"""
        post_data = {
            "title": {"en": f"TEST_Post_{uuid.uuid4().hex[:8]}", "gu": "ટેસ્ટ પોસ્ટ"},
            "slug": f"test-post-{uuid.uuid4().hex[:8]}",
            "excerpt": {"en": "Test excerpt", "gu": "ટેસ્ટ સારાંશ"},
            "content": {"en": "Test content", "gu": "ટેસ્ટ સામગ્રી"},
            "cover_image": "",
            "author": "Test Author",
            "tags": ["test"],
            "is_published": False
        }
        response = requests.post(f"{BASE_URL}/api/blog", json=post_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Created blog post with ID: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/blog/{data['id']}", headers=auth_headers)
    
    def test_update_blog_post(self, auth_headers):
        """Test updating a blog post"""
        # Create post first
        post_data = {
            "title": {"en": f"TEST_Update_{uuid.uuid4().hex[:8]}", "gu": "અપડેટ ટેસ્ટ"},
            "slug": f"test-update-{uuid.uuid4().hex[:8]}",
            "excerpt": {"en": "Original excerpt", "gu": "મૂળ સારાંશ"},
            "content": {"en": "Original content", "gu": "મૂળ સામગ્રી"},
            "cover_image": "",
            "author": "Test Author",
            "tags": [],
            "is_published": False
        }
        create_response = requests.post(f"{BASE_URL}/api/blog", json=post_data, headers=auth_headers)
        post_id = create_response.json()["id"]
        
        # Update
        post_data["title"]["en"] = "Updated Title"
        post_data["is_published"] = True
        response = requests.put(f"{BASE_URL}/api/blog/{post_id}", json=post_data, headers=auth_headers)
        assert response.status_code == 200
        print(f"✓ Updated blog post {post_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/blog/{post_id}", headers=auth_headers)


class TestSettingsAPI:
    """Site settings tests"""
    
    def test_get_public_settings(self):
        """Test fetching public settings (no auth)"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "bank_details" in data
        assert "trust_details" in data
        assert "contact_info" in data
        print("✓ Public settings fetched successfully")
    
    def test_get_admin_settings(self, auth_headers):
        """Test fetching admin settings (with auth)"""
        response = requests.get(f"{BASE_URL}/api/settings/admin", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "smtp_config" in data or "razorpay_config" in data or "bank_details" in data
        print("✓ Admin settings fetched successfully")
    
    def test_update_settings(self, auth_headers):
        """Test updating site settings"""
        update_data = {
            "impact_stats": {
                "families_helped": 5001,
                "education_drives": 151,
                "medical_camps": 76,
                "years_of_service": 12
            }
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        print("✓ Settings updated successfully")


class TestDonationsAPI:
    """Donations API tests"""
    
    def test_get_donations(self, auth_headers):
        """Test fetching donations list (admin)"""
        response = requests.get(f"{BASE_URL}/api/donations", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Fetched {len(data)} donations")
    
    def test_export_80g_data(self, auth_headers):
        """Test exporting 80G data as CSV"""
        response = requests.get(f"{BASE_URL}/api/donations/export-80g", headers=auth_headers)
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        print("✓ 80G export successful (CSV format)")


class TestContactAPI:
    """Contact submissions tests"""
    
    def test_get_contacts(self, auth_headers):
        """Test fetching contact submissions (admin)"""
        response = requests.get(f"{BASE_URL}/api/contact", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Fetched {len(data)} contact submissions")
    
    def test_submit_contact(self):
        """Test submitting a contact form"""
        contact_data = {
            "name": f"TEST_Contact_{uuid.uuid4().hex[:8]}",
            "email": "test@example.com",
            "phone": "1234567890",
            "subject": "Test Subject",
            "message": "Test message content",
            "is_volunteer": False
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=contact_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Contact submitted with ID: {data['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
