# Local Donation Exchange Platform

A comprehensive platform for managing donations, volunteers, and community engagement with blockchain integration for transparent monetary donations.

## Overview

LDEP is a full-stack web application built with **Next.js** that connects donors with volunteers to facilitate both monetary and physical donations. The platform includes role-based access for admins, donors, and volunteers, with a custom blockchain component and SSLCommerz payment integration to ensure transparency in financial transactions.

## Screenshots

### Landing Page
| Hero Section | Community & Contact |
|---|---|
| ![Landing Page Hero](https://github.com/user-attachments/assets/c49845f4-8ef3-499d-b0f2-a750f36615c8) | ![Landing Page Community](https://github.com/user-attachments/assets/2026a1e4-63cf-4135-865e-a99c31c15ab4) |

### Admin Dashboard
| Task Management | Blockchain Verification |
|---|---|
| ![Admin Task Management](https://github.com/user-attachments/assets/2a32b085-c745-4e12-9ef7-0807f49e261d) | ![Admin Blockchain Verification](https://github.com/user-attachments/assets/bdb2b5ee-5a96-4670-a6bf-df01b85b1b86) |

### Donor Dashboard
| Monetary Donation (SSLCommerz) | Physical Donation |
|---|---|
| ![Donor Monetary Donation](https://github.com/user-attachments/assets/972ca155-84c8-4589-a9de-ccdc699d3e40) | ![Donor Physical Donation](https://github.com/user-attachments/assets/24606753-7a1c-4f75-a4ca-5d93513f0a06) |

### Volunteer Dashboard
| My Tasks |
|---|
| ![Volunteer My Tasks](https://github.com/user-attachments/assets/ccfc7a88-286b-4378-a85c-6633eb18da5b) |

---

## Key Features

- **User Authentication & Roles**: Support for Admin, Donor, and Volunteer roles with secure JWT authentication
- **Monetary Donations**: SSLCommerz payment gateway integration with blockchain-recorded transactions
- **Physical Donations**: Donors can submit physical donation requests that volunteers can fulfill
- **Volunteer Management**: Admins can approve/reject volunteer applications and assign tasks
- **Task Management**: Volunteers receive tasks to collect physical donations with deadline tracking
- **Volunteer Live Map**: Real-time volunteer location tracking with nearest volunteer detection
- **Leaderboard**: Donor leaderboard to encourage community participation
- **Referral System**: Users can refer others to the platform
- **Contact & Messaging**: Users can contact admins with built-in reply support
- **Feedback System**: Donors can rate and review volunteer services
- **Real-time Notifications**: Users receive notifications for important events
- **Admin Dashboard**: Comprehensive overview with statistics, user management, and transaction ledger
- **Blockchain Verification**: Donors and admins can verify transactions on the blockchain
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS and Radix UI

## Tech Stack

### Frontend & Full-Stack Framework
- **Next.js** — React framework with App Router, SSR, and built-in API routes
- **React.js** — UI library
- **Tailwind CSS** — Utility-first CSS framework
- **Radix UI** — Accessible component primitives

### Backend (via Next.js API Routes)
- **Next.js API Routes** — Serverless backend endpoints
- **MongoDB** — NoSQL database
- **Mongoose** — MongoDB object modeling
- **JWT** — Authentication tokens
- **SSLCommerz** — Bangladesh payment gateway integration

### Blockchain
- **Custom Proof-of-Work Blockchain** — Built using Node.js built-in `crypto` module (SHA-256 hashing) for donation recording and transparency

### Other
- **Email Service** — Notification and password reset emails
- **Distance Calculation** — Nearest volunteer detection via geolocation

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── api/                      # All backend API routes
│   │   ├── auth/                 # Login, register, profile, password reset
│   │   ├── contact/              # Contact messages & admin replies
│   │   ├── donations/
│   │   │   ├── monetary/         # Monetary donation CRUD + approve/reject
│   │   │   ├── physical/         # Physical donation CRUD + approve/reject
│   │   │   ├── blockchain/       # Blockchain ledger endpoint
│   │   │   ├── leaderboard/      # Donor leaderboard
│   │   │   └── sslcommerz/       # Payment initiate, success, fail, cancel
│   │   ├── feedback/             # Feedback submission and retrieval
│   │   ├── notifications/        # Per-user notifications, read/unread
│   │   ├── referral/             # Referral system
│   │   ├── seed/                 # Database seeding
│   │   ├── stats/                # Platform statistics and charts
│   │   ├── tasks/                # Task management for volunteers
│   │   ├── volunteer/            # Volunteer location tracking
│   │   └── volunteers/           # Approve/reject, nearest volunteer
│   │
│   └── payment/                  # SSLCommerz redirect pages
│       ├── success/page.tsx
│       ├── fail/page.tsx
│       └── cancel/page.tsx
│
├── components/                   # React components
│   ├── admin/                    # Admin dashboard, volunteer map, ledger
│   ├── donor/                    # Donation forms, blockchain verify, track
│   └── volunteer/                # Tasks, location, proof upload
│
├── lib/                          # Utilities & shared logic
│   ├── auth-context.tsx          # Authentication context
│   ├── mongodb.ts                # Database connection
│   ├── email-service.ts          # Email notifications
│   ├── distance.ts               # Geolocation distance calculation
│   ├── areaCoordinates.ts        # Area coordinate mappings
│   ├── store.ts                  # Data store layer
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Utility functions
│
└── server/                       # Standalone backend logic
    ├── blockchain/
    │   └── blockchain.js         # Custom proof-of-work blockchain
    └── models/                   # Mongoose models
        ├── User.js
        ├── MonetaryDonation.js
        ├── PhysicalDonation.js
        ├── Task.js
        ├── Feedback.js
        ├── Notification.js
        └── ContactMessage.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/morshaline1504/-LDEP/edit/main/README.md>
   cd donatechain
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```


3. **Run the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Access the application**

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Seeding

The application can be seeded via the `/api/seed` endpoint on first run. This includes:
- Admin user account
- Sample donors and volunteers
- Example donations and tasks

## API Endpoints

### Authentication
- `POST /api/auth/login` — User login
- `POST /api/auth/register/donor` — Donor registration
- `POST /api/auth/register/volunteer` — Volunteer registration
- `GET/PUT /api/auth/profile` — View/update profile
- `POST /api/auth/forgot-password` — Password reset request
- `POST /api/auth/reset-password` — Password reset confirm

### Donations — Monetary
- `POST /api/donations/monetary` — Create monetary donation
- `GET /api/donations/monetary/donor/[donorId]` — Donor's monetary donations
- `PUT /api/donations/monetary/[id]/approve` — Approve donation
- `PUT /api/donations/monetary/[id]/reject` — Reject donation

### Donations — Physical
- `POST /api/donations/physical` — Create physical donation request
- `GET /api/donations/physical/donor/[donorId]` — Donor's physical donations
- `PUT /api/donations/physical/[id]/approve` — Approve donation
- `PUT /api/donations/physical/[id]/reject` — Reject donation

### SSLCommerz Payment
- `POST /api/donations/sslcommerz/initiate` — Initiate payment session
- `POST /api/donations/sslcommerz/success` — Payment success callback
- `POST /api/donations/sslcommerz/fail` — Payment failure callback
- `POST /api/donations/sslcommerz/cancel` — Payment cancel callback
- `GET /api/donations/sslcommerz/status` — Check payment status

### Blockchain
- `GET /api/donations/blockchain` — Get full blockchain ledger

### Volunteers
- `GET /api/volunteers/pending` — Get pending volunteer applications
- `GET /api/volunteers/approved` — Get approved volunteers
- `PUT /api/volunteers/[id]/approve` — Approve volunteer
- `PUT /api/volunteers/[id]/reject` — Reject volunteer
- `GET /api/volunteers/nearest` — Get nearest volunteer by location
- `GET/POST /api/volunteer/location` — Volunteer location management
- `GET /api/volunteer/location/[taskId]` — Get volunteer location for a task

### Tasks
- `POST /api/tasks` — Create task for volunteer
- `GET /api/tasks` — Get all tasks
- `PUT /api/tasks/[id]/status` — Update task status
- `GET /api/tasks/donor/[donorId]` — Tasks by donor
- `GET /api/tasks/volunteer/[volunteerId]` — Tasks by volunteer

### Other
- `GET /api/donations/leaderboard` — Donor leaderboard
- `GET /api/referral/[userId]` — Referral info
- `GET/POST /api/feedback` — Feedback management
- `GET /api/feedback/donor/[donorId]` — Donor's feedback
- `GET /api/notifications/[userId]` — User notifications
- `PUT /api/notifications/[userId]/read` — Mark as read
- `PUT /api/notifications/[userId]/read-all` — Mark all as read
- `GET /api/notifications/[userId]/unread-count` — Unread count
- `GET/POST /api/contact` — Contact messages
- `GET /api/contact/[id]` — Single message
- `POST /api/contact/reply` — Admin reply to message
- `GET /api/stats` — Platform statistics
- `GET /api/stats/charts` — Chart data

## User Roles & Permissions

### Admin
- Full access to all features
- User management (approve/reject volunteers)
- View all donations, tasks, and feedback
- Reply to contact messages
- Access to transaction ledger and blockchain verification
- Platform statistics and analytics
- View volunteer live map

### Donor
- Register and make monetary donations (via SSLCommerz)
- Submit physical donation requests
- Track donation and pickup status
- Verify donations on the blockchain
- Submit feedback for completed tasks
- View leaderboard and referral info
- Receive notifications

### Volunteer
- Apply for volunteer status (requires admin approval)
- View and accept assigned tasks
- Update task status with proof photos
- Share live location for task tracking
- View feedback received

## Blockchain Integration

Monetary donations are recorded on a custom blockchain implementation:
- Each donation creates a new block
- Blocks are mined with proof-of-work (difficulty: 2)
- Built using Node.js built-in `crypto` module (SHA-256 hashing)
- Transaction hash and block number are stored with each donation
- Donors and admins can verify transactions via the blockchain verification UI
- Ensures transparency and immutability of financial records

## Development

### Available Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Build for production
- `pnpm start` — Start production server
t

### Database Models

- **User** — Authentication and profile data
- **MonetaryDonation** — Financial donations with SSLCommerz and blockchain data
- **PhysicalDonation** — Non-monetary donation requests
- **Task** — Volunteer assignments for physical donations
- **Feedback** — Donor reviews of volunteer services
- **Notification** — User notifications
- **ContactMessage** — User-to-admin messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

While the platform successfully meets its current objectives, several enhancements are planned for future development:

- [ ] **Mobile Application** — Developing a dedicated Android and iOS mobile application using React Native to make the platform more accessible to donors and volunteers who primarily use smartphones.
- [ ] **AI-Based Volunteer Matching** — Integrating an AI recommendation engine that automatically matches the most suitable volunteer to a physical donation task based on location proximity, availability, and past performance ratings.
- [ ] **Real-Time Chat Support** — Adding an in-platform messaging system to allow direct communication between donors, volunteers, and administrators without relying solely on SMS and email notifications.
- [ ] **Advanced Analytics Dashboard** — Enhancing the admin dashboard with detailed data visualizations including donation trends, volunteer performance graphs, and geographic heatmaps of donation activity.
- [ ] **Multi-Language Support** — Adding Bengali language support to make the platform more accessible to a wider range of users across Bangladesh.
- [ ] **Automated Fraud Detection** — Implementing an AI-based fraud detection system that flags suspicious donation transactions or unusual platform activity for admin review.
- [ ] **Donation Campaign Management** — Allowing administrators to create and manage targeted donation campaigns with specific goals, deadlines, and progress tracking visible to all donors on the platform.
- [ ] **Third-Party Blockchain Integration** — Migrating from the current in-house blockchain implementation to a public blockchain network such as Ethereum for greater transparency, decentralization, and public verifiability of all donation transactions.
