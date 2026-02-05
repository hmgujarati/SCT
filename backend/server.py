from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, Response, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import razorpay
import hmac
import hashlib
import json
import csv
import io
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'shivdhara-charitable-secret-key-2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="Shivdhara Charitable Trust API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================ PYDANTIC MODELS ================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "editor"  # admin or editor

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Site Settings Models
class BankDetails(BaseModel):
    account_holder_name: str = ""
    account_number: str = ""
    bank_name: str = ""
    branch_name: str = ""
    ifsc_code: str = ""
    micr_code: str = ""

class TrustDetails(BaseModel):
    registration_no: str = ""
    pan: str = ""
    darpan_id: str = ""
    csr_no: str = ""
    reg_80g: str = ""
    reg_12a: str = ""

class ContactInfo(BaseModel):
    address_en: str = ""
    address_gu: str = ""
    phone: str = ""
    email: str = ""
    whatsapp: str = ""

class UPIDetails(BaseModel):
    upi_id: str = ""
    qr_code_url: str = ""

class SMTPConfig(BaseModel):
    host: str = ""
    port: int = 587
    username: str = ""
    password: str = ""
    from_email: str = ""
    from_name: str = ""

class RazorpayConfig(BaseModel):
    key_id: str = ""
    key_secret: str = ""
    webhook_secret: str = ""
    is_live: bool = False

class SiteSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bank_details: BankDetails = Field(default_factory=BankDetails)
    trust_details: TrustDetails = Field(default_factory=TrustDetails)
    contact_info: ContactInfo = Field(default_factory=ContactInfo)
    upi_details: UPIDetails = Field(default_factory=UPIDetails)
    smtp_config: SMTPConfig = Field(default_factory=SMTPConfig)
    razorpay_config: RazorpayConfig = Field(default_factory=RazorpayConfig)
    impact_stats: Dict[str, Any] = Field(default_factory=dict)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SiteSettingsUpdate(BaseModel):
    bank_details: Optional[BankDetails] = None
    trust_details: Optional[TrustDetails] = None
    contact_info: Optional[ContactInfo] = None
    upi_details: Optional[UPIDetails] = None
    smtp_config: Optional[SMTPConfig] = None
    razorpay_config: Optional[RazorpayConfig] = None
    impact_stats: Optional[Dict[str, Any]] = None

# Content Models (Bilingual)
class BilingualContent(BaseModel):
    en: str = ""
    gu: str = ""

class PageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_key: str  # home, about, donate, contact, etc.
    section_key: str  # hero_title, hero_subtitle, etc.
    content: BilingualContent
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PageContentCreate(BaseModel):
    page_key: str
    section_key: str
    content: BilingualContent

# Donation Models
class DonorInfo(BaseModel):
    name: str
    email: EmailStr
    phone: str

class Form80G(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    pan_number: str
    address: str
    country: str = "India"
    state: str
    city: str
    zip_code: str

class DonationCreate(BaseModel):
    amount: int  # in INR (not paise)
    donor_info: DonorInfo
    needs_80g: bool = False
    form_80g: Optional[Form80G] = None

class DonationRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: int
    donor_info: DonorInfo
    needs_80g: bool
    form_80g: Optional[Form80G] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: str = "pending"  # pending, paid, failed
    receipt_sent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    paid_at: Optional[datetime] = None

# Gallery Models
class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    caption: BilingualContent
    order: int = 0

class GalleryAlbum(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: BilingualContent
    category: str  # education, health, relief, community
    images: List[GalleryImage] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryAlbumCreate(BaseModel):
    title: BilingualContent
    category: str
    images: List[GalleryImage] = []
    is_active: bool = True

# Blog Models
class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: BilingualContent
    slug: str
    excerpt: BilingualContent
    content: BilingualContent
    cover_image: str = ""
    author: str = ""
    tags: List[str] = []
    is_published: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

class BlogPostCreate(BaseModel):
    title: BilingualContent
    slug: str
    excerpt: BilingualContent
    content: BilingualContent
    cover_image: str = ""
    author: str = ""
    tags: List[str] = []
    is_published: bool = False

# Success Story Models
class SuccessStory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: BilingualContent
    person_name: BilingualContent
    location: BilingualContent
    problem: BilingualContent
    help_provided: BilingualContent
    impact: BilingualContent
    quote: BilingualContent
    image_url: str = ""
    category: str  # education, health, relief
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SuccessStoryCreate(BaseModel):
    title: BilingualContent
    person_name: BilingualContent
    location: BilingualContent
    problem: BilingualContent
    help_provided: BilingualContent
    impact: BilingualContent
    quote: BilingualContent
    image_url: str = ""
    category: str
    is_active: bool = True
    order: int = 0

# Contact Models
class ContactSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str = ""
    subject: str = ""
    message: str
    is_volunteer: bool = False
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    subject: str = ""
    message: str
    is_volunteer: bool = False

# ================ HELPER FUNCTIONS ================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def get_site_settings():
    settings = await db.site_settings.find_one({}, {"_id": 0})
    if not settings:
        default_settings = SiteSettings()
        await db.site_settings.insert_one(default_settings.model_dump())
        return default_settings.model_dump()
    return settings

def get_razorpay_client():
    """Get Razorpay client with current settings"""
    # Try environment variables first, then fall back to test keys
    key_id = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_dPABC1234WXYZ')
    key_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'test_secret_key_placeholder')
    return razorpay.Client(auth=(key_id, key_secret))

async def send_email(to_email: str, subject: str, html_content: str, text_content: str = ""):
    settings = await get_site_settings()
    smtp = settings.get('smtp_config', {})
    
    if not smtp.get('host') or not smtp.get('username'):
        logger.warning("SMTP not configured, skipping email")
        return False
    
    try:
        message = MIMEMultipart("alternative")
        message["From"] = f"{smtp.get('from_name', 'Shivdhara Charitable')} <{smtp.get('from_email', smtp['username'])}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        if text_content:
            message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))
        
        await aiosmtplib.send(
            message,
            hostname=smtp['host'],
            port=smtp['port'],
            username=smtp['username'],
            password=smtp['password'],
            use_tls=True
        )
        return True
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return False

# ================ AUTH ROUTES ================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if this is first user (make them admin)
    user_count = await db.users.count_documents({})
    role = "admin" if user_count == 0 else user_data.role
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "role": role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email, role)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            role=role,
            created_at=datetime.fromisoformat(user_doc['created_at'])
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'], user['role'])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            role=user['role'],
            created_at=datetime.fromisoformat(user['created_at']) if isinstance(user['created_at'], str) else user['created_at']
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        role=user['role'],
        created_at=datetime.fromisoformat(user['created_at']) if isinstance(user['created_at'], str) else user['created_at']
    )

# ================ SITE SETTINGS ROUTES ================

@api_router.get("/settings")
async def get_settings():
    """Public settings (excludes sensitive data)"""
    settings = await get_site_settings()
    # Remove sensitive data for public access
    public_settings = {
        "bank_details": settings.get('bank_details', {}),
        "trust_details": settings.get('trust_details', {}),
        "contact_info": settings.get('contact_info', {}),
        "upi_details": settings.get('upi_details', {}),
        "impact_stats": settings.get('impact_stats', {}),
        "razorpay_key_id": settings.get('razorpay_config', {}).get('key_id', os.environ.get('RAZORPAY_KEY_ID', ''))
    }
    return public_settings

@api_router.get("/settings/admin")
async def get_admin_settings(user: dict = Depends(get_admin_user)):
    """Full settings for admin"""
    return await get_site_settings()

@api_router.put("/settings")
async def update_settings(updates: SiteSettingsUpdate, user: dict = Depends(get_admin_user)):
    update_dict = {k: v.model_dump() if hasattr(v, 'model_dump') else v for k, v in updates.model_dump(exclude_none=True).items()}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.site_settings.update_one({}, {"$set": update_dict}, upsert=True)
    return {"message": "Settings updated successfully"}

# ================ CONTENT ROUTES (Bilingual) ================

@api_router.get("/content")
async def get_all_content():
    """Get all page content"""
    content = await db.page_content.find({}, {"_id": 0}).to_list(1000)
    return content

@api_router.get("/content/{page_key}")
async def get_page_content(page_key: str):
    """Get content for a specific page"""
    content = await db.page_content.find({"page_key": page_key}, {"_id": 0}).to_list(100)
    # Convert to dict for easier access
    content_dict = {}
    for item in content:
        content_dict[item['section_key']] = item['content']
    return content_dict

@api_router.post("/content")
async def create_content(content: PageContentCreate, user: dict = Depends(get_current_user)):
    content_doc = PageContent(**content.model_dump())
    doc = content_doc.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.page_content.insert_one(doc)
    return {"message": "Content created", "id": content_doc.id}

@api_router.put("/content/{page_key}/{section_key}")
async def update_content(page_key: str, section_key: str, content: BilingualContent, user: dict = Depends(get_current_user)):
    result = await db.page_content.update_one(
        {"page_key": page_key, "section_key": section_key},
        {"$set": {"content": content.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"message": "Content updated"}

# ================ DONATION ROUTES ================

@api_router.post("/donations/create-order")
async def create_donation_order(donation: DonationCreate):
    """Create Razorpay order for donation"""
    try:
        razorpay_client = get_razorpay_client()
        
        # Create order (amount in paise)
        order_data = {
            "amount": donation.amount * 100,  # Convert to paise
            "currency": "INR",
            "receipt": f"donation_{str(uuid.uuid4())[:8]}",
            "payment_capture": 1
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        # Save donation record
        donation_record = DonationRecord(
            amount=donation.amount,
            donor_info=donation.donor_info,
            needs_80g=donation.needs_80g,
            form_80g=donation.form_80g,
            razorpay_order_id=order['id'],
            status="pending"
        )
        doc = donation_record.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        if doc.get('paid_at'):
            doc['paid_at'] = doc['paid_at'].isoformat()
        await db.donations.insert_one(doc)
        
        return {
            "order_id": order['id'],
            "amount": order['amount'],
            "currency": order['currency'],
            "donation_id": donation_record.id
        }
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/donations/verify")
async def verify_donation(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    background_tasks: BackgroundTasks
):
    """Verify Razorpay payment"""
    try:
        razorpay_client = get_razorpay_client()
        
        # Verify signature
        params = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        razorpay_client.utility.verify_payment_signature(params)
        
        # Update donation record
        now = datetime.now(timezone.utc).isoformat()
        donation = await db.donations.find_one_and_update(
            {"razorpay_order_id": razorpay_order_id},
            {"$set": {
                "razorpay_payment_id": razorpay_payment_id,
                "status": "paid",
                "paid_at": now
            }},
            return_document=True
        )
        
        if donation:
            # Send confirmation email in background
            background_tasks.add_task(send_donation_confirmation_email, donation)
        
        return {"status": "success", "message": "Payment verified successfully"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        logger.error(f"Payment verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def send_donation_confirmation_email(donation: dict):
    """Send bilingual donation confirmation email"""
    donor = donation.get('donor_info', {})
    amount = donation.get('amount', 0)
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8B1E1E; color: white; padding: 20px; text-align: center;">
            <h1>Thank You for Your Donation!</h1>
            <h1>આપના દાન માટે આભાર!</h1>
        </div>
        <div style="padding: 20px; background: #F7F1E6;">
            <p>Dear {donor.get('name', 'Donor')},</p>
            <p>પ્રિય {donor.get('name', 'દાતા')},</p>
            
            <p>Your generous donation of <strong>₹{amount:,}</strong> has been received successfully.</p>
            <p>આપનું ₹{amount:,} નું ઉદાર દાન સફળતાપૂર્વક પ્રાપ્ત થયું છે.</p>
            
            <p>Your contribution will help us continue our mission of providing lifelong care, dignity, and support to individuals with intellectual disabilities.</p>
            <p>આપનું યોગદાન બૌદ્ધિક વિકલાંગતા ધરાવતી વ્યક્તિઓને આજીવન સંભાળ, ગૌરવ અને સહાય પ્રદાન કરવાના અમારા મિશનમાં મદદ કરશે.</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>Donation Details / દાનની વિગતો:</h3>
                <p><strong>Amount / રકમ:</strong> ₹{amount:,}</p>
                <p><strong>Date / તારીખ:</strong> {datetime.now().strftime('%d %B %Y')}</p>
                <p><strong>Payment ID:</strong> {donation.get('razorpay_payment_id', 'N/A')}</p>
            </div>
            
            {"<p><em>Your 80G receipt will be sent separately. / આપની 80G રસીદ અલગથી મોકલવામાં આવશે.</em></p>" if donation.get('needs_80g') else ""}
            
            <p>With gratitude / આભાર સાથે,<br>
            <strong>Shivdhara Charitable Trust</strong><br>
            <strong>શિવધારા ચેરીટેબલ ટ્રસ્ટ</strong></p>
        </div>
    </body>
    </html>
    """
    
    await send_email(
        donor.get('email', ''),
        "Thank You for Your Donation - Shivdhara Charitable / આપના દાન માટે આભાર",
        html_content
    )

@api_router.get("/donations")
async def get_donations(user: dict = Depends(get_current_user)):
    """Get all donations (admin only)"""
    donations = await db.donations.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return donations

@api_router.get("/donations/export-80g")
async def export_80g_data(user: dict = Depends(get_admin_user)):
    """Export 80G requests as CSV"""
    donations = await db.donations.find(
        {"needs_80g": True, "status": "paid"},
        {"_id": 0}
    ).to_list(1000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        'Date', 'Amount', 'Full Name', 'Email', 'Phone', 'PAN', 
        'Address', 'City', 'State', 'Country', 'Zip', 'Payment ID'
    ])
    
    for d in donations:
        form = d.get('form_80g', {})
        writer.writerow([
            d.get('paid_at', d.get('created_at', '')),
            d.get('amount', 0),
            form.get('full_name', ''),
            form.get('email', ''),
            form.get('phone', ''),
            form.get('pan_number', ''),
            form.get('address', ''),
            form.get('city', ''),
            form.get('state', ''),
            form.get('country', ''),
            form.get('zip_code', ''),
            d.get('razorpay_payment_id', '')
        ])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=80g_requests.csv"}
    )

# ================ GALLERY ROUTES ================

@api_router.get("/gallery")
async def get_gallery():
    """Get all active gallery albums"""
    albums = await db.gallery.find({"is_active": True}, {"_id": 0}).to_list(100)
    return albums

@api_router.get("/gallery/all")
async def get_all_gallery(user: dict = Depends(get_current_user)):
    """Get all gallery albums (including inactive) for admin"""
    albums = await db.gallery.find({}, {"_id": 0}).to_list(100)
    return albums

@api_router.get("/gallery/{album_id}")
async def get_album(album_id: str):
    album = await db.gallery.find_one({"id": album_id}, {"_id": 0})
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    return album

@api_router.post("/gallery")
async def create_album(album: GalleryAlbumCreate, user: dict = Depends(get_current_user)):
    album_doc = GalleryAlbum(**album.model_dump())
    doc = album_doc.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.gallery.insert_one(doc)
    return {"message": "Album created", "id": album_doc.id}

@api_router.put("/gallery/{album_id}")
async def update_album(album_id: str, album: GalleryAlbumCreate, user: dict = Depends(get_current_user)):
    await db.gallery.update_one(
        {"id": album_id},
        {"$set": album.model_dump()}
    )
    return {"message": "Album updated"}

@api_router.delete("/gallery/{album_id}")
async def delete_album(album_id: str, user: dict = Depends(get_admin_user)):
    await db.gallery.delete_one({"id": album_id})
    return {"message": "Album deleted"}

# ================ BLOG ROUTES ================

@api_router.get("/blog")
async def get_blog_posts(limit: int = 10):
    """Get published blog posts"""
    posts = await db.blog.find(
        {"is_published": True}, 
        {"_id": 0}
    ).sort("published_at", -1).to_list(limit)
    return posts

@api_router.get("/blog/all")
async def get_all_blog_posts(user: dict = Depends(get_current_user)):
    """Get all blog posts for admin"""
    posts = await db.blog.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    post = await db.blog.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@api_router.post("/blog")
async def create_blog_post(post: BlogPostCreate, user: dict = Depends(get_current_user)):
    post_doc = BlogPost(**post.model_dump())
    if post.is_published:
        post_doc.published_at = datetime.now(timezone.utc)
    doc = post_doc.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('published_at'):
        doc['published_at'] = doc['published_at'].isoformat()
    await db.blog.insert_one(doc)
    return {"message": "Post created", "id": post_doc.id}

@api_router.put("/blog/{post_id}")
async def update_blog_post(post_id: str, post: BlogPostCreate, user: dict = Depends(get_current_user)):
    update_data = post.model_dump()
    if post.is_published:
        # Check if it wasn't published before
        existing = await db.blog.find_one({"id": post_id}, {"_id": 0})
        if existing and not existing.get('is_published'):
            update_data['published_at'] = datetime.now(timezone.utc).isoformat()
    await db.blog.update_one({"id": post_id}, {"$set": update_data})
    return {"message": "Post updated"}

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, user: dict = Depends(get_admin_user)):
    await db.blog.delete_one({"id": post_id})
    return {"message": "Post deleted"}

# ================ SUCCESS STORIES ROUTES ================

@api_router.get("/stories")
async def get_stories():
    """Get active success stories"""
    stories = await db.stories.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return stories

@api_router.get("/stories/all")
async def get_all_stories(user: dict = Depends(get_current_user)):
    """Get all stories for admin"""
    stories = await db.stories.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return stories

@api_router.get("/stories/{story_id}")
async def get_story(story_id: str):
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story

@api_router.post("/stories")
async def create_story(story: SuccessStoryCreate, user: dict = Depends(get_current_user)):
    story_doc = SuccessStory(**story.model_dump())
    doc = story_doc.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.stories.insert_one(doc)
    return {"message": "Story created", "id": story_doc.id}

@api_router.put("/stories/{story_id}")
async def update_story(story_id: str, story: SuccessStoryCreate, user: dict = Depends(get_current_user)):
    await db.stories.update_one({"id": story_id}, {"$set": story.model_dump()})
    return {"message": "Story updated"}

@api_router.delete("/stories/{story_id}")
async def delete_story(story_id: str, user: dict = Depends(get_admin_user)):
    await db.stories.delete_one({"id": story_id})
    return {"message": "Story deleted"}

# ================ CONTACT ROUTES ================

@api_router.post("/contact")
async def submit_contact(submission: ContactSubmissionCreate, background_tasks: BackgroundTasks):
    """Submit contact form"""
    contact_doc = ContactSubmission(**submission.model_dump())
    doc = contact_doc.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact.insert_one(doc)
    
    # Send notification email to admin in background
    background_tasks.add_task(notify_admin_contact, doc)
    
    return {"message": "Message sent successfully", "id": contact_doc.id}

async def notify_admin_contact(contact: dict):
    """Notify admin about new contact submission"""
    settings = await get_site_settings()
    admin_email = settings.get('contact_info', {}).get('email')
    if not admin_email:
        return
    
    html = f"""
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> {contact.get('name')}</p>
    <p><strong>Email:</strong> {contact.get('email')}</p>
    <p><strong>Phone:</strong> {contact.get('phone', 'N/A')}</p>
    <p><strong>Subject:</strong> {contact.get('subject', 'N/A')}</p>
    <p><strong>Message:</strong> {contact.get('message')}</p>
    <p><strong>Volunteer Interest:</strong> {'Yes' if contact.get('is_volunteer') else 'No'}</p>
    """
    await send_email(admin_email, f"New Contact: {contact.get('subject', 'Message')}", html)

@api_router.get("/contact")
async def get_contacts(user: dict = Depends(get_current_user)):
    """Get all contact submissions"""
    contacts = await db.contact.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return contacts

@api_router.put("/contact/{contact_id}/read")
async def mark_contact_read(contact_id: str, user: dict = Depends(get_current_user)):
    await db.contact.update_one({"id": contact_id}, {"$set": {"is_read": True}})
    return {"message": "Marked as read"}

@api_router.delete("/contact/{contact_id}")
async def delete_contact(contact_id: str, user: dict = Depends(get_admin_user)):
    await db.contact.delete_one({"id": contact_id})
    return {"message": "Contact deleted"}

# ================ SEED DATA ROUTE ================

@api_router.post("/seed")
async def seed_initial_data():
    """Seed initial content data"""
    # Check if already seeded
    existing = await db.page_content.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    # Seed home page content
    home_content = [
        {
            "page_key": "home",
            "section_key": "hero_title",
            "content": {
                "en": "Serving Humanity with Compassion",
                "gu": "કરુણા સાથે માનવતાની સેવા"
            }
        },
        {
            "page_key": "home",
            "section_key": "hero_subtitle",
            "content": {
                "en": "Together, we can transform lives through education, healthcare, and community support. Your contribution creates lasting change.",
                "gu": "સાથે મળીને, આપણે શિક્ષણ, આરોગ્ય સેવા અને સમુદાય સહાય દ્વારા જીવન બદલી શકીએ છીએ. તમારું યોગદાન કાયમી પરિવર્તન લાવે છે."
            }
        },
        {
            "page_key": "home",
            "section_key": "donate_cta",
            "content": {
                "en": "Donate Now",
                "gu": "હવે દાન કરો"
            }
        },
        {
            "page_key": "home",
            "section_key": "impact_title",
            "content": {
                "en": "Our Impact",
                "gu": "અમારી અસર"
            }
        },
        {
            "page_key": "home",
            "section_key": "programs_title",
            "content": {
                "en": "Our Programs",
                "gu": "અમારા કાર્યક્રમો"
            }
        },
        {
            "page_key": "home",
            "section_key": "transparency_title",
            "content": {
                "en": "Transparency & Trust",
                "gu": "પારદર્શકતા અને વિશ્વાસ"
            }
        },
        {
            "page_key": "home",
            "section_key": "transparency_text",
            "content": {
                "en": "Every rupee you donate is accounted for. We maintain complete transparency in our operations and publish annual reports detailing how your contributions are utilized. Our books are audited by certified accountants and we are registered under 80G, 12A, and CSR Act.",
                "gu": "તમે દાન કરેલ દરેક રૂપિયો હિસાબમાં લેવામાં આવે છે. અમે અમારી કામગીરીમાં સંપૂર્ણ પારદર્શિતા જાળવીએ છીએ અને તમારા યોગદાનનો કેવી રીતે ઉપયોગ થાય છે તેની વિગતો આપતા વાર્ષિક અહેવાલો પ્રકાશિત કરીએ છીએ. અમારા હિસાબો પ્રમાણિત એકાઉન્ટન્ટ્સ દ્વારા ઓડિટ કરવામાં આવે છે અને અમે 80G, 12A અને CSR એક્ટ હેઠળ નોંધાયેલ છીએ."
            }
        },
        {
            "page_key": "home",
            "section_key": "cta_title",
            "content": {
                "en": "Join Our Mission Today",
                "gu": "આજે અમારા મિશનમાં જોડાઓ"
            }
        },
        {
            "page_key": "home",
            "section_key": "cta_text",
            "content": {
                "en": "Your monthly donation ensures sustained support for families in need. Together, we can build a more compassionate society.",
                "gu": "તમારું માસિક દાન જરૂરિયાતમંદ પરિવારોને સતત સહાયની ખાતરી આપે છે. સાથે મળીને, આપણે વધુ કરુણામય સમાજ બનાવી શકીએ છીએ."
            }
        }
    ]
    
    # About page content
    about_content = [
        {
            "page_key": "about",
            "section_key": "title",
            "content": {
                "en": "About Shivdhara Charitable Trust",
                "gu": "શિવધારા ચેરીટેબલ ટ્રસ્ટ વિશે"
            }
        },
        {
            "page_key": "about",
            "section_key": "intro",
            "content": {
                "en": "Shivdhara Charitable Trust was established with a sacred mission to serve humanity through selfless action. Inspired by the eternal flow of Lord Shiva's grace, we believe that true worship lies in serving those in need. For over a decade, we have been working tirelessly to uplift underprivileged communities across Gujarat through education, healthcare, and relief services.",
                "gu": "શિવધારા ચેરીટેબલ ટ્રસ્ટની સ્થાપના નિઃસ્વાર્થ સેવા દ્વારા માનવતાની સેવા કરવાના પવિત્ર મિશન સાથે કરવામાં આવી હતી. ભગવાન શિવની કૃપાના શાશ્વત પ્રવાહથી પ્રેરિત, અમે માનીએ છીએ કે સાચી પૂજા જરૂરિયાતમંદોની સેવામાં છે. એક દાયકાથી વધુ સમયથી, અમે ગુજરાતભરના વંચિત સમુદાયોને શિક્ષણ, આરોગ્ય સેવા અને રાહત સેવાઓ દ્વારા ઉત્થાન કરવા માટે અથાક મહેનત કરી રહ્યા છીએ."
            }
        },
        {
            "page_key": "about",
            "section_key": "vision_title",
            "content": {
                "en": "Our Vision",
                "gu": "અમારું વિઝન"
            }
        },
        {
            "page_key": "about",
            "section_key": "vision",
            "content": {
                "en": "To create a society where every individual has access to quality education, healthcare, and basic necessities, regardless of their economic background. We envision a world where compassion drives action and service to humanity becomes a way of life.",
                "gu": "એક એવો સમાજ બનાવવો જ્યાં દરેક વ્યક્તિને તેમની આર્થિક પૃષ્ઠભૂમિને ધ્યાનમાં લીધા વિના ગુણવત્તાયુક્ત શિક્ષણ, આરોગ્ય સેવા અને મૂળભૂત જરૂરિયાતો મળી રહે. અમે એક એવી દુનિયાની કલ્પના કરીએ છીએ જ્યાં કરુણા ક્રિયાને પ્રેરિત કરે અને માનવતાની સેવા જીવનનો માર્ગ બને."
            }
        },
        {
            "page_key": "about",
            "section_key": "mission_title",
            "content": {
                "en": "Our Mission",
                "gu": "અમારું મિશન"
            }
        },
        {
            "page_key": "about",
            "section_key": "mission",
            "content": {
                "en": "To provide educational support to underprivileged children, organize free medical camps in rural areas, distribute food and essentials during emergencies, and empower communities through sustainable development initiatives. We are committed to transparent operations and accountable stewardship of every donation.",
                "gu": "વંચિત બાળકોને શૈક્ષણિક સહાય પૂરી પાડવી, ગ્રામીણ વિસ્તારોમાં મફત તબીબી શિબિરોનું આયોજન કરવું, કટોકટી દરમિયાન ખોરાક અને આવશ્યક ચીજો વિતરણ કરવી, અને ટકાઉ વિકાસ પહેલ દ્વારા સમુદાયોને સશક્ત બનાવવા. અમે પારદર્શક કામગીરી અને દરેક દાનના જવાબદાર સંચાલન માટે પ્રતિબદ્ધ છીએ."
            }
        },
        {
            "page_key": "about",
            "section_key": "values_title",
            "content": {
                "en": "Our Values",
                "gu": "અમારા મૂલ્યો"
            }
        }
    ]
    
    # Donate page content
    donate_content = [
        {
            "page_key": "donate",
            "section_key": "title",
            "content": {
                "en": "Make a Difference Today",
                "gu": "આજે ફરક લાવો"
            }
        },
        {
            "page_key": "donate",
            "section_key": "subtitle",
            "content": {
                "en": "Your generosity can transform lives. Every contribution, no matter how small, creates ripples of positive change in someone's life.",
                "gu": "તમારી ઉદારતા જીવન બદલી શકે છે. દરેક યોગદાન, ભલે ગમે તેટલું નાનું હોય, કોઈના જીવનમાં હકારાત્મક પરિવર્તનની લહેરો બનાવે છે."
            }
        },
        {
            "page_key": "donate",
            "section_key": "impact_text",
            "content": {
                "en": "₹501 provides school supplies for a child for a year. ₹1001 sponsors a medical checkup for a family. ₹2501 feeds a family for a month.",
                "gu": "₹501 એક બાળકને એક વર્ષ માટે શાળાની સામગ્રી પૂરી પાડે છે. ₹1001 એક પરિવાર માટે તબીબી તપાસ સ્પોન્સર કરે છે. ₹2501 એક પરિવારને એક મહિના માટે ખવડાવે છે."
            }
        }
    ]
    
    # Contact page content
    contact_content = [
        {
            "page_key": "contact",
            "section_key": "title",
            "content": {
                "en": "Get in Touch",
                "gu": "સંપર્કમાં રહો"
            }
        },
        {
            "page_key": "contact",
            "section_key": "subtitle",
            "content": {
                "en": "Have questions or want to volunteer? We'd love to hear from you.",
                "gu": "પ્રશ્નો છે અથવા સ્વયંસેવક બનવા માંગો છો? અમને તમારા તરફથી સાંભળવું ગમશે."
            }
        }
    ]
    
    all_content = home_content + about_content + donate_content + contact_content
    
    for content in all_content:
        content['id'] = str(uuid.uuid4())
        content['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.page_content.insert_one(content)
    
    # Seed impact stats
    impact_stats = {
        "families_helped": 5000,
        "education_drives": 150,
        "medical_camps": 75,
        "years_of_service": 12
    }
    
    await db.site_settings.update_one(
        {},
        {"$set": {"impact_stats": impact_stats}},
        upsert=True
    )
    
    # Seed sample success stories
    stories = [
        {
            "id": str(uuid.uuid4()),
            "title": {"en": "From Darkness to Light", "gu": "અંધકારથી પ્રકાશ તરફ"},
            "person_name": {"en": "Ramesh Patel", "gu": "રમેશ પટેલ"},
            "location": {"en": "Mehsana, Gujarat", "gu": "મહેસાણા, ગુજરાત"},
            "problem": {"en": "Ramesh's family struggled to afford his school fees after his father lost his job during the pandemic. The 12-year-old was about to drop out of school to help his family.", "gu": "રમેશના પિતાએ રોગચાળા દરમિયાન નોકરી ગુમાવ્યા પછી તેના પરિવાર તેની શાળાની ફી ચૂકવવામાં મુશ્કેલી અનુભવી રહ્યો હતો. 12 વર્ષનો છોકરો તેના પરિવારને મદદ કરવા માટે શાળા છોડવાના આરે હતો."},
            "help_provided": {"en": "Shivdhara Charitable Trust sponsored Ramesh's complete education including school fees, books, uniform, and transportation for three years.", "gu": "શિવધારા ચેરીટેબલ ટ્રસ્ટે રમેશના શાળા ફી, પુસ્તકો, ગણવેશ અને ત્રણ વર્ષ માટે પરિવહન સહિત સંપૂર્ણ શિક્ષણને સ્પોન્સર કર્યું."},
            "impact": {"en": "Today, Ramesh is a top performer in his class, dreaming of becoming a doctor. His father found new employment, and the family is now self-sufficient.", "gu": "આજે, રમેશ તેના વર્ગમાં ટોચનો વિદ્યાર્થી છે, ડૉક્ટર બનવાનું સ્વપ્ન જોઈ રહ્યો છે. તેના પિતાને નવી નોકરી મળી, અને પરિવાર હવે સ્વનિર્ભર છે."},
            "quote": {"en": "Education is my weapon to fight poverty. Thank you Shivdhara for believing in me.", "gu": "શિક્ષણ ગરીબી સામે લડવાનું મારું હથિયાર છે. મારામાં વિશ્વાસ રાખવા માટે શિવધારાનો આભાર."},
            "image_url": "https://images.unsplash.com/photo-1659451336016-00d62d32f677?crop=entropy&cs=srgb&fm=jpg&q=85",
            "category": "education",
            "is_active": True,
            "order": 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": {"en": "A New Lease on Life", "gu": "જીવન પર નવી શરૂઆત"},
            "person_name": {"en": "Kantaben Shah", "gu": "કાંતાબેન શાહ"},
            "location": {"en": "Sabarkantha, Gujarat", "gu": "સાબરકાંઠા, ગુજરાત"},
            "problem": {"en": "65-year-old Kantaben had been suffering from cataracts for years but couldn't afford the surgery. Her deteriorating vision had made her completely dependent on others.", "gu": "65 વર્ષીય કાંતાબેન વર્ષોથી મોતિયાથી પીડાતા હતા પણ સર્જરીનો ખર્ચ ઉઠાવી શકતા નહોતા. તેમની બગડતી દ્રષ્ટિએ તેમને સંપૂર્ણપણે બીજા પર નિર્ભર બનાવી દીધા હતા."},
            "help_provided": {"en": "Our free eye camp identified her condition, and we sponsored her complete cataract surgery at a partnered hospital.", "gu": "અમારા મફત આંખની શિબિરે તેમની સ્થિતિ ઓળખી, અને અમે ભાગીદાર હોસ્પિટલમાં તેમની સંપૂર્ણ મોતિયાની સર્જરી સ્પોન્સર કરી."},
            "impact": {"en": "Kantaben can now see clearly and has returned to her daily activities. She even started a small vegetable garden to supplement her family's income.", "gu": "કાંતાબેન હવે સ્પષ્ટ જોઈ શકે છે અને તેમની દૈનિક પ્રવૃત્તિઓમાં પાછા ફર્યા છે. તેમણે પોતાના પરિવારની આવકમાં વધારો કરવા માટે નાનો શાકભાજીનો બગીચો પણ શરૂ કર્યો."},
            "quote": {"en": "I can see my grandchildren's faces again. This is the greatest blessing.", "gu": "હું મારા પૌત્રોના ચહેરા ફરીથી જોઈ શકું છું. આ સૌથી મોટો આશીર્વાદ છે."},
            "image_url": "https://images.pexels.com/photos/7904406/pexels-photo-7904406.jpeg",
            "category": "health",
            "is_active": True,
            "order": 2,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": {"en": "Rebuilding After the Storm", "gu": "તોફાન પછી પુનઃનિર્માણ"},
            "person_name": {"en": "The Vaghela Family", "gu": "વાઘેલા પરિવાર"},
            "location": {"en": "Kutch, Gujarat", "gu": "કચ્છ, ગુજરાત"},
            "problem": {"en": "The Vaghela family lost everything when floods destroyed their home and livelihood. With five children and elderly parents, they were left with nothing but the clothes on their backs.", "gu": "પૂરે તેમનું ઘર અને આજીવિકા નાશ કરી ત્યારે વાઘેલા પરિવારે બધું ગુમાવ્યું. પાંચ બાળકો અને વૃદ્ધ માતા-પિતા સાથે, તેમની પાસે પહેરેલા કપડા સિવાય કંઈ બચ્યું નહોતું."},
            "help_provided": {"en": "We provided immediate relief including food, clothing, temporary shelter, and later helped rebuild their home. We also supported the father in restarting his small farming business.", "gu": "અમે ખોરાક, કપડાં, કામચલાઉ આશ્રય સહિત તાત્કાલિક રાહત પૂરી પાડી, અને પછી તેમનું ઘર ફરીથી બનાવવામાં મદદ કરી. અમે પિતાને તેમનો નાનો ખેતીનો વ્યવસાય ફરી શરૂ કરવામાં પણ સહાય કરી."},
            "impact": {"en": "The family now lives in a sturdy new home with proper facilities. All children are back in school, and the father's farm is flourishing again.", "gu": "પરિવાર હવે યોગ્ય સુવિધાઓ સાથે મજબૂત નવા ઘરમાં રહે છે. બધા બાળકો શાળામાં પાછા છે, અને પિતાનું ખેતર ફરીથી ખીલી રહ્યું છે."},
            "quote": {"en": "When we had lost all hope, Shivdhara became our family. They didn't just give us aid, they gave us dignity.", "gu": "જ્યારે અમે બધી આશા ગુમાવી દીધી હતી, ત્યારે શિવધારા અમારો પરિવાર બની ગયો. તેમણે અમને માત્ર સહાય જ નહીં આપી, તેમણે અમને ગૌરવ આપ્યું."},
            "image_url": "https://images.unsplash.com/photo-1663069107186-5e9be9c750f4?crop=entropy&cs=srgb&fm=jpg&q=85",
            "category": "relief",
            "is_active": True,
            "order": 3,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for story in stories:
        await db.stories.insert_one(story)
    
    # Seed sample blog posts
    blog_posts = [
        {
            "id": str(uuid.uuid4()),
            "title": {"en": "The Power of Education: Breaking the Cycle of Poverty", "gu": "શિક્ષણની શક્તિ: ગરીબીના ચક્રને તોડવું"},
            "slug": "power-of-education",
            "excerpt": {"en": "Education is the most powerful weapon we can use to change the world. Learn how Shivdhara is making a difference one child at a time.", "gu": "શિક્ષણ એ દુનિયા બદલવા માટે આપણે વાપરી શકીએ એવું સૌથી શક્તિશાળી હથિયાર છે. જાણો કેવી રીતે શિવધારા એક સમયે એક બાળકને ફરક લાવી રહ્યું છે."},
            "content": {"en": "Education is not just about learning to read and write. It's about empowerment, dignity, and hope. At Shivdhara Charitable Trust, we have witnessed countless transformations where education has lifted entire families out of poverty.\n\nWhen we sponsor a child's education, we're not just paying for books and fees. We're investing in a future leader, a potential doctor, engineer, or teacher who will one day give back to their community.\n\nOur education program covers:\n- Complete school fees and supplies\n- Nutritious mid-day meals\n- After-school tutoring support\n- Career guidance and counseling\n- Skill development workshops\n\nEvery child deserves the chance to dream big. Your support makes these dreams possible.", "gu": "શિક્ષણ માત્ર વાંચવા અને લખવાનું શીખવા વિશે નથી. તે સશક્તિકરણ, ગૌરવ અને આશા વિશે છે. શિવધારા ચેરીટેબલ ટ્રસ્ટ ખાતે, અમે અસંખ્ય પરિવર્તનો જોયા છે જ્યાં શિક્ષણે આખા પરિવારોને ગરીબીમાંથી બહાર કાઢ્યા છે.\n\nજ્યારે અમે બાળકના શિક્ષણને સ્પોન્સર કરીએ છીએ, ત્યારે અમે માત્ર પુસ્તકો અને ફી માટે ચૂકવણી કરતા નથી. અમે ભાવિ નેતા, સંભવિત ડૉક્ટર, એન્જિનિયર અથવા શિક્ષકમાં રોકાણ કરી રહ્યા છીએ જે એક દિવસ તેમના સમુદાયને પાછું આપશે.\n\nઅમારો શિક્ષણ કાર્યક્રમ આવરી લે છે:\n- સંપૂર્ણ શાળા ફી અને પુરવઠો\n- પૌષ્ટિક મધ્યાહન ભોજન\n- શાળા પછી ટ્યુટરિંગ સપોર્ટ\n- કારકિર્દી માર્ગદર્શન અને કાઉન્સેલિંગ\n- કૌશલ્ય વિકાસ વર્કશોપ\n\nદરેક બાળક મોટા સ્વપ્ના જોવાની તક લાયક છે. તમારો સપોર્ટ આ સ્વપ્નાઓને શક્ય બનાવે છે."},
            "cover_image": "https://images.unsplash.com/photo-1659451336016-00d62d32f677?crop=entropy&cs=srgb&fm=jpg&q=85",
            "author": "Shivdhara Team",
            "tags": ["education", "children", "empowerment"],
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": {"en": "Healthcare for All: Our Medical Camp Initiative", "gu": "બધા માટે આરોગ્ય સેવા: અમારી મેડિકલ કેમ્પ પહેલ"},
            "slug": "healthcare-for-all",
            "excerpt": {"en": "Access to healthcare is a basic human right. Discover how our free medical camps are bringing essential services to underserved communities.", "gu": "આરોગ્ય સેવાની પહોંચ એ મૂળભૂત માનવ અધિકાર છે. જાણો કેવી રીતે અમારા મફત મેડિકલ કેમ્પ વંચિત સમુદાયો સુધી આવશ્યક સેવાઓ લાવી રહ્યા છે."},
            "content": {"en": "In rural Gujarat, many families must travel hours to reach the nearest hospital. For routine checkups, chronic disease management, or preventive care, this journey is often impossible.\n\nOur mobile medical camps bridge this gap by bringing healthcare to the doorstep of these communities. In collaboration with dedicated doctors and healthcare professionals, we organize regular camps offering:\n\n- General health checkups\n- Eye examinations and cataract surgeries\n- Dental care\n- Women's health services\n- Blood pressure and diabetes screening\n- Medicine distribution\n\nSince inception, we have conducted over 75 medical camps, serving more than 25,000 patients. But our work is far from complete. With your support, we can expand our reach to more villages and more lives.", "gu": "ગ્રામીણ ગુજરાતમાં, ઘણા પરિવારોએ નજીકની હોસ્પિટલ પહોંચવા માટે કલાકો મુસાફરી કરવી પડે છે. નિયમિત તપાસ, ક્રોનિક રોગ વ્યવસ્થાપન, અથવા નિવારક સંભાળ માટે, આ મુસાફરી ઘણીવાર અશક્ય છે.\n\nઅમારા મોબાઈલ મેડિકલ કેમ્પ આ સમુદાયોના દરવાજે આરોગ્ય સેવા લાવીને આ અંતર ભરે છે. સમર્પિત ડૉક્ટરો અને આરોગ્ય સેવા વ્યાવસાયિકો સાથે સહયોગમાં, અમે નિયમિત શિબિરોનું આયોજન કરીએ છીએ જે આપે છે:\n\n- સામાન્ય આરોગ્ય તપાસ\n- આંખની તપાસ અને મોતિયાની સર્જરી\n- દાંતની સંભાળ\n- મહિલા આરોગ્ય સેવાઓ\n- બ્લડ પ્રેશર અને ડાયાબિટીસ સ્ક્રીનિંગ\n- દવા વિતરણ\n\nશરૂઆતથી, અમે 75 થી વધુ મેડિકલ કેમ્પ કર્યા છે, 25,000 થી વધુ દર્દીઓની સેવા કરી છે. પરંતુ અમારું કામ પૂર્ણ થયાથી દૂર છે. તમારા સપોર્ટ સાથે, અમે વધુ ગામડાઓ અને વધુ જીવન સુધી અમારી પહોંચ વધારી શકીએ છીએ."},
            "cover_image": "https://images.pexels.com/photos/7579824/pexels-photo-7579824.jpeg",
            "author": "Dr. Mehta",
            "tags": ["healthcare", "medical camps", "community"],
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for post in blog_posts:
        await db.blog.insert_one(post)
    
    # Seed sample gallery albums
    albums = [
        {
            "id": str(uuid.uuid4()),
            "title": {"en": "Education Programs", "gu": "શિક્ષણ કાર્યક્રમો"},
            "category": "education",
            "images": [
                {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1659451336016-00d62d32f677?crop=entropy&cs=srgb&fm=jpg&q=85", "caption": {"en": "Students at our learning center", "gu": "અમારા શિક્ષણ કેન્દ્ર પર વિદ્યાર્થીઓ"}, "order": 0},
                {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1735966329265-6b57ed8dd2ef?crop=entropy&cs=srgb&fm=jpg&q=85", "caption": {"en": "Book distribution drive", "gu": "પુસ્તક વિતરણ અભિયાન"}, "order": 1}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": {"en": "Medical Camps", "gu": "મેડિકલ કેમ્પ"},
            "category": "health",
            "images": [
                {"id": str(uuid.uuid4()), "url": "https://images.pexels.com/photos/7904406/pexels-photo-7904406.jpeg", "caption": {"en": "Free eye checkup camp", "gu": "મફત આંખની તપાસ શિબિર"}, "order": 0},
                {"id": str(uuid.uuid4()), "url": "https://images.pexels.com/photos/7579824/pexels-photo-7579824.jpeg", "caption": {"en": "Health awareness session", "gu": "આરોગ્ય જાગૃતિ સત્ર"}, "order": 1}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": {"en": "Relief Distribution", "gu": "રાહત વિતરણ"},
            "category": "relief",
            "images": [
                {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1663069107186-5e9be9c750f4?crop=entropy&cs=srgb&fm=jpg&q=85", "caption": {"en": "Food distribution during flood relief", "gu": "પૂર રાહત દરમિયાન ખોરાક વિતરણ"}, "order": 0},
                {"id": str(uuid.uuid4()), "url": "https://images.pexels.com/photos/6995221/pexels-photo-6995221.jpeg", "caption": {"en": "Essential supplies for families", "gu": "પરિવારો માટે આવશ્યક પુરવઠો"}, "order": 1}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for album in albums:
        await db.gallery.insert_one(album)
    
    return {"message": "Initial data seeded successfully"}

# ================ ROOT ROUTE ================

@api_router.get("/")
async def root():
    return {"message": "Shivdhara Charitable Trust API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
