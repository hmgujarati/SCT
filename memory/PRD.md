# Shivdhara Charitable Trust - Bilingual NGO Website

## Project Overview
Professional bilingual (English + Gujarati) website for Shivdhara Charitable Trust with donation optimization, admin panel, and full content management.

## Original Problem Statement
Build a professional bilingual website for a charitable trust with:
- Full bilingual support (English + Gujarati)
- Donation system with 80G tax exemption support
- Razorpay payment integration
- Admin panel for all content management
- Trust and bank details in footer

## User Personas
1. **Donors** - Indian donors (local + NRI) seeking to contribute to charitable causes
2. **Gujarati Community** - Native Gujarati speakers preferring content in their language
3. **Corporate CSR Managers** - Companies looking for 80G/CSR compliant NGOs
4. **Volunteers** - People wanting to contribute time and skills
5. **Admin Users** - Trust staff managing content and donations

## Core Requirements (Static)
- [x] Bilingual support (EN/GU) with instant language switching
- [x] Donation flow with Razorpay integration
- [x] 80G tax exemption form with all required fields
- [x] Admin panel with JWT authentication
- [x] Content management in both languages
- [x] Trust details, bank details, UPI in footer (admin editable)
- [x] Gallery albums by category
- [x] Success stories with Problem→Help→Impact format
- [x] Blog with bilingual posts
- [x] Contact form with volunteer interest option

## Architecture
- **Frontend**: React 18 with React Router, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI with MongoDB
- **Payment**: Razorpay (test mode, configurable to live)
- **Email**: SMTP (Hostinger, configurable from admin)
- **Authentication**: JWT-based admin auth

## What's Been Implemented (January 2026)
1. **Homepage** - Hero, Impact stats, Programs, Success Stories preview, Blog preview, CTA
2. **About Page** - Vision, Mission, Values, Compliance badges
3. **Gallery Page** - Albums with category filter, lightbox viewer
4. **Success Stories** - Category filter, Problem→Help→Impact format
5. **Blog** - List view and single post view
6. **Donate Page** - Amount selection, donor info, 80G form, Razorpay integration
7. **Contact Page** - Form with WhatsApp button
8. **Login Page** - Email/password with toggle to register
9. **Admin Panel** - Dashboard, Settings (Contact, Bank, Trust, UPI, SMTP, Razorpay, Impact stats), Donations list, 80G CSV export, Contact messages

## Prioritized Backlog

### P0 - Critical (Done)
- [x] All public pages functional
- [x] Language switching working
- [x] Donation flow working
- [x] Admin authentication

### P1 - High Priority
- [ ] Add real Razorpay live keys from admin
- [ ] Configure SMTP for email notifications
- [ ] Add actual trust registration details
- [ ] Add bank details and UPI QR code
- [ ] Upload real images to gallery

### P2 - Medium Priority  
- [ ] Full CRUD in admin for Gallery albums
- [ ] Full CRUD in admin for Blog posts
- [ ] Full CRUD in admin for Success Stories
- [ ] Page content editing from admin
- [ ] Google Maps integration on contact page

### P3 - Nice to Have
- [ ] SEO meta tags per page
- [ ] Social sharing buttons
- [ ] Monthly donation subscription option
- [ ] Donor certificate generation
- [ ] Annual report download

## Next Action Items
1. Login to admin (/login) and add trust registration details
2. Add bank details and UPI QR code from admin settings
3. Configure SMTP for email notifications
4. Replace test Razorpay keys with live keys when ready
5. Upload real gallery images and stories
