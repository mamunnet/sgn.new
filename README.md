# SGN Academy - School Management System

A comprehensive school management system built with React, Firebase, and Tailwind CSS.

## 🌟 Features

- **Student Management**
  - Admission Management
  - Student Records
  - Transfer Certificate Generation
  - Student Profile Management

- **Staff Management**
  - Staff Directory
  - Staff Profile Management
  - Experience & Qualifications Tracking

- **Fee Management**
  - Fee Collection
  - Payment Tracking
  - Receipt Generation
  - Due/Overdue Management

- **Administrative Features**
  - Notice Board Management
  - Event Management
  - Banner Management
  - Alumni Management

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **UI Components**: Headless UI, Framer Motion
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form
- **PDF Generation**: html2canvas, jsPDF
- **Build Tool**: Vite

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sgn-academy.git
   cd sgn-academy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_ADMIN_EMAIL=admin@example.com
   VITE_SCHOOL_PHONE="+1234567890"
   VITE_SCHOOL_ADDRESS="Your School Address"
   VITE_SCHOOL_DISE_CODE="12345"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Build

To build the project for production:

```bash
npm run build
```

The build output will be in the `dist` directory.

## 🚀 Deployment

### Netlify Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add your environment variables in Netlify's dashboard
5. Deploy!

## 🔒 Firebase Security Rules

### Firestore Rules

The project includes secure Firestore rules for:
- Public collections (notices, events, alumni, banners)
- Protected collections (students, staff, certificates, fees)
- Admin-only operations

### Storage Rules

Secure storage rules for:
- Image uploads (size and type validation)
- PDF uploads
- Access control based on authentication

## 🧪 Development

### File Structure

```
src/
├── components/     # React components
│   ├── admin/     # Admin dashboard components
│   └── common/    # Shared components
├── pages/         # Page components
├── lib/          # Firebase configuration
├── types/        # TypeScript types
└── utils/        # Utility functions
```

### Key Components

- `AdminDashboard`: Main admin interface
- `StudentAdmission`: Student registration
- `TCGenerator`: Transfer certificate generation
- `FeesManager`: Fee management system
- `StaffManager`: Staff management system

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any queries, please reach out to [your-email@example.com](mailto:your-email@example.com)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Lucide Icons](https://lucide.dev/)