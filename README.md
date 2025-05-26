# Blogsphere Backend

Blogsphere is a modern blogging platform backend built with Node.js, Express, and MongoDB.  
It allows users to **signup/login**, create, edit, and delete their blogs, and explore blogs posted by others.

---

## Features

- User signup and login with secure password hashing and JWT authentication
- Add, edit, delete blogs by authenticated users
- View blogs of all users with pagination and related info (likes, comments)
- Password reset functionality with OTP verification
- Image upload support using Multer (temporary server storage) and Cloudinary (cloud storage)
- Secure authentication with signed HTTP-only cookies and multi-step validation middleware

---

## Data Models

- **User:** Stores user information and credentials
- **Blog:** Stores blog posts with author reference
- **Like:** Tracks likes on blogs by users
- **Comment:** Stores comments made by users on blogs
- **OtpCodes:** Stores OTP codes for password reset verification

---

## Key Packages Used

- `express` – Web framework
- `mongoose` – MongoDB object modeling
- `mongoose-aggregate-paginate-v2` – Pagination with aggregation for optimized queries
- `bcrypt` – Password hashing for secure storage
- `jsonwebtoken` – JWT for secure user sessions
- `cookie-parser` – Parsing cookies for authentication
- `cors` – Handling Cross-Origin Resource Sharing
- `helmet` – Securing HTTP headers
- `express-rate-limit` – Rate limiting to protect APIs
- `multer` – File upload handling (temporary storage)
- `nodemailer` – Sending OTP emails via Gmail SMTP
- `shortid` – Generating unique OTP codes
- `dotenv` – Loading environment variables
- Custom middleware for multi-step password reset validation

---

## Security

- Passwords hashed using bcrypt
- JWT tokens stored in signed HTTP-only cookies with `httpOnly` and `secure` flags enabled for extra protection
- Rate limiting and helmet for API security hardening

---

## Contact

Feel free to connect with me on LinkedIn:  
[Usman Hameed](https://www.linkedin.com/in/usman-hameed-05b513240/)