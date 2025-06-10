# 🏕️ CISV Kids Evaluation System

Hệ thống đánh giá trẻ em sau trại hè CISV với khả năng đánh giá đa kid, auto-save, offline support và leaderboard real-time.

## ✨ Tính năng chính

### 🎯 **Core Features**
- **Kids Collection riêng biệt** - Dữ liệu kids được lưu trong collection độc lập
- **3-5 kids per leader** - Mỗi leader có thể quản lý từ 3-5 kids
- **Multi-kid evaluation** - Đánh giá nhiều kids cùng lúc trên 1 form
- **Auto-save mỗi 30 giây** - Tự động lưu dữ liệu để tránh mất thông tin
- **Offline support** - Hoạt động kể cả khi mất mạng với LocalStorage backup
- **Real-time leaderboard** - Bảng xếp hạng cập nhật theo thời gian thực
- **Vietnamese interface** - Giao diện hoàn toàn bằng tiếng Việt

### 🎨 **UI/UX Features**
- **Responsive design** - Tối ưu cho mọi thiết bị
- **Modern UI** - Giao diện đẹp với styled-components
- **Interactive animations** - Hiệu ứng mượt mà
- **Progress tracking** - Theo dõi tiến độ chi tiết
- **Toast notifications** - Thông báo thân thiện

### 🛡️ **Technical Features**
- **MongoDB Atlas ready** - Sẵn sàng kết nối cloud database
- **Production ready** - Code chất lượng production
- **Docker support** - Container hóa hoàn chỉnh
- **Error handling** - Xử lý lỗi toàn diện
- **Security features** - Bảo mật cơ bản
- **Rate limiting** - Giới hạn request

## 🏗️ Kiến trúc hệ thống

### **Frontend (React)**
```
frontend/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks (auto-save, etc.)
│   ├── services/         # API & localStorage services
│   ├── contexts/         # React contexts
│   ├── styles/           # CSS styles
│   └── utils/            # Utility functions
├── package.json
└── Dockerfile
```

### **Backend (Node.js + Express)**
```
backend/
├── src/
│   ├── controllers/      # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── config/          # Configuration files
│   └── utils/           # Utilities & seed data
├── package.json
└── Dockerfile
```

### **Database Schema (MongoDB)**
```javascript
// Collections:
- camps          // Trại chính
- subcamps       // Trại nhỏ
- leaders        // Leader quản lý
- kids           // Trẻ em (collection riêng biệt)
- questions      // Câu hỏi đánh giá
- evaluations    // Kết quả đánh giá
```

## 🚀 Cài đặt và chạy

### **Yêu cầu hệ thống**
- Node.js 18+
- MongoDB Atlas account (hoặc MongoDB local)
- Git

### **1. Clone repository**
```bash
git clone <repository-url>
cd cisv-evaluation-system
```

### **2. Cấu hình Backend**
```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.template .env

# Chỉnh sửa .env với thông tin của bạn
nano .env
```

**Cấu hình .env backend:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cisv_evaluation
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

### **3. Cấu hình Frontend**
```bash
cd ../frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.template .env

# Chỉnh sửa .env với thông tin của bạn
nano .env
```

**Cấu hình .env frontend:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AUTOSAVE_INTERVAL=30000
```

### **4. Seed dữ liệu mẫu**
```bash
cd ../backend
npm run seed
```

### **5. Chạy ứng dụng**

**Chạy Backend:**
```bash
cd backend
npm run dev    # Development mode
# hoặc
npm start      # Production mode
```

**Chạy Frontend:**
```bash
cd frontend
npm start
```

**Truy cập ứng dụng:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🐳 Chạy với Docker

### **Docker Compose (Khuyến nghị)**
```bash
# Tạo file .env trong thư mục gốc
cp .env.example .env

# Chỉnh sửa với MongoDB Atlas URI của bạn
nano .env

# Chạy toàn bộ hệ thống
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng hệ thống
docker-compose down
```

### **Build riêng lẻ**
```bash
# Build backend
cd backend
docker build -t cisv-backend .

# Build frontend
cd ../frontend
docker build -t cisv-frontend .

# Run containers
docker run -d -p 5000:5000 --env-file ../.env cisv-backend
docker run -d -p 3000:80 cisv-frontend
```

## 📊 Cấu trúc Database

### **Relationships**
```
Camp (1) ──→ (N) Subcamp
Subcamp (1) ──→ (N) Leader
Leader (1) ──→ (3-5) Kid
Kid (N) ──→ (N) Evaluation ←── (N) Question
```

### **Key Models**

**Kids Model** (Collection riêng biệt):
```javascript
{
  name: String,
  age: Number,
  nationality: String,
  subcampId: ObjectId,
  leaderId: ObjectId,
  evaluationStatus: {
    isCompleted: Boolean,
    completedQuestions: Number,
    totalQuestions: Number
  }
}
```

**Evaluation Model**:
```javascript
{
  leaderId: ObjectId,
  kidId: ObjectId,
  questionId: ObjectId,
  rating: Number (1-5),
  comment: String,
  isCompleted: Boolean,
  submittedAt: Date
}
```

## 🔌 API Endpoints

### **Camps**
```
GET    /api/camps                    # Lấy tất cả trại
GET    /api/camps/:id                # Lấy trại cụ thể
POST   /api/camps                    # Tạo trại mới
```

### **Subcamps**
```
GET    /api/subcamps                 # Lấy tất cả trại nhỏ
GET    /api/subcamps/camp/:campId    # Lấy theo trại
POST   /api/subcamps                 # Tạo trại nhỏ mới
```

### **Leaders**
```
GET    /api/leaders                  # Lấy tất cả leader
GET    /api/leaders/subcamp/:id      # Lấy theo trại nhỏ
GET    /api/leaders/:id/kids         # Lấy kids của leader
```

### **Kids** (Collection riêng biệt)
```
GET    /api/kids                     # Lấy tất cả kids
GET    /api/kids/leader/:leaderId    # Lấy kids theo leader
POST   /api/kids                     # Tạo kid mới
PUT    /api/kids/:id                 # Cập nhật kid
```

### **Evaluations**
```
GET    /api/evaluations/leader/:id           # Lấy đánh giá của leader
POST   /api/evaluations/auto-save           # Auto-save (30s)
POST   /api/evaluations/submit              # Submit cuối cùng
GET    /api/evaluations/leaderboard/:campId # Bảng xếp hạng
GET    /api/evaluations/progress/:subcampId # Tiến độ trại nhỏ
```

## 🎯 Workflow sử dụng

### **1. Chọn trại**
- Hiển thị danh sách các trại CISV
- Tìm kiếm và filter
- Chọn trái để bắt đầu

### **2. Chọn trại nhỏ**
- Hiển thị các team/nhóm trong trại
- Xem progress completion của từng nhóm
- Chọn nhóm để tiếp tục

### **3. Chọn leader**
- Hiển thị danh sách leaders trong nhóm
- Thông tin kids được phân công (3-5 kids)
- Trạng thái đánh giá: Not Started / In Progress / Completed

### **4. Form đánh giá**
- Đánh giá 3-5 kids cùng lúc
- Rating 1-5 sao cho từng câu hỏi
- Comment tùy chọn cho mỗi câu hỏi
- Auto-save mỗi 30 giây
- Progress bar theo dõi tiến độ
- Offline support với LocalStorage

### **5. Bảng xếp hạng**
- Ranking các trại nhỏ theo completion %
- Real-time updates
- Thống kê tổng quan
- Export capabilities

## 🔧 Development

### **Scripts có sẵn**

**Backend:**
```bash
npm start      # Chạy production
npm run dev    # Chạy development với nodemon
npm run seed   # Tạo dữ liệu mẫu
npm test       # Chạy tests
```

**Frontend:**
```bash
npm start      # Chạy development server
npm run build  # Build for production
npm test       # Chạy tests
npm run eject  # Eject từ create-react-app
```

### **Code Structure**

**Frontend Components:**
- `CampSelection` - Chọn trại
- `SubcampSelection` - Chọn trại nhỏ
- `LeaderSelection` - Chọn leader
- `EvaluationForm` - Form đánh giá chính (core)
- `Leaderboard` - Bảng xếp hạng

**Custom Hooks:**
- `useAutoSave` - Auto-save logic
- `useEvaluation` - Evaluation context management

**Backend Controllers:**
- `evaluationController` - Logic đánh giá chính
- `kidController` - Quản lý kids (collection riêng)
- `leaderController` - Quản lý leaders
- `campController` - Quản lý camps/subcamps

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **Rate limiting** - Chống spam requests
- **CORS** - Cross-origin protection
- **Input validation** - Joi validation
- **Error handling** - Không expose sensitive info
- **Environment variables** - Sensitive data protection

## 📱 Mobile Support

- **Responsive design** - Mobile-first approach
- **Touch-friendly** - Optimized for touch interfaces
- **Offline support** - LocalStorage cho mobile
- **PWA ready** - Service worker support (future)

## 🔄 Offline Support

### **Frontend Offline Features:**
- LocalStorage backup cho tất cả data
- Offline detection
- Auto-sync khi có mạng trở lại
- Toast notifications cho offline status

### **Data Persistence:**
```javascript
// Auto-save mỗi 30 giây
- Online: Lưu lên server + LocalStorage backup
- Offline: Chỉ lưu LocalStorage, đánh dấu cần sync
- Recovery: Auto-sync khi có mạng trở lại
```

## 🚀 Deployment

### **Production Checklist:**

1. **Environment Variables:**
   - Set NODE_ENV=production
   - Configure MongoDB Atlas URI
   - Set secure JWT_SECRET
   - Configure CORS origins

2. **Database:**
   - MongoDB Atlas cluster
   - Proper indexes
   - Backup strategy

3. **Frontend:**
   - Build optimized bundle
   - Configure API URLs
   - Enable Gzip compression

4. **Security:**
   - HTTPS only
   - Secure headers
   - Rate limiting
   - Input validation

### **Deployment Options:**

**Option 1: Docker + VPS**
```bash
# Clone repo trên server
git clone <repo>

# Cấu hình .env
vim .env

# Deploy với Docker Compose
docker-compose up -d

# Setup reverse proxy (nginx)
# Setup SSL (Let's Encrypt)
```

**Option 2: Heroku**
```bash
# Frontend -> Netlify/Vercel
# Backend -> Heroku
# Database -> MongoDB Atlas
```

**Option 3: AWS/GCP/Azure**
```bash
# Frontend -> S3/CloudFront
# Backend -> EC2/App Engine/App Service
# Database -> MongoDB Atlas
```

## 🐛 Troubleshooting

### **Common Issues:**

**1. MongoDB Connection Error:**
```bash
# Kiểm tra connection string
# Kiểm tra network access trong MongoDB Atlas
# Kiểm tra username/password
```

**2. CORS Error:**
```bash
# Kiểm tra FRONTEND_URL trong backend .env
# Kiểm tra API_URL trong frontend .env
```

**3. Auto-save không hoạt động:**
```bash
# Kiểm tra network tab trong browser
# Kiểm tra localStorage trong dev tools
# Kiểm tra console logs
```

**4. Kids không hiển thị:**
```bash
# Chạy seed data: npm run seed
# Kiểm tra leaderId trong database
# Kiểm tra API response
```

## 📚 Documentation

### **API Documentation:**
- Truy cập http://localhost:5000 khi chạy backend
- Swagger docs (future enhancement)

### **Code Documentation:**
- JSDoc comments trong code
- README cho mỗi module
- TypeScript definitions (future)

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

### **Code Standards:**
- ESLint configuration
- Prettier formatting
- Conventional commits
- Test coverage > 80%

## 📄 License

MIT License - see LICENSE file for details.

## 👥 Team

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Styled Components
- **DevOps**: Docker + Docker Compose
- **Database**: MongoDB Atlas

## 🔄 Changelog

### **v1.0.0**
- ✅ Kids collection riêng biệt
- ✅ 3-5 kids per leader support
- ✅ Multi-kid evaluation form
- ✅ Auto-save mỗi 30 giây
- ✅ Offline support với LocalStorage
- ✅ Real-time leaderboard
- ✅ Vietnamese interface
- ✅ Responsive design
- ✅ Production ready code
- ✅ Docker support

## 🎯 Roadmap

### **v1.1.0 (Future)**
- [ ] PWA support
- [ ] Push notifications
- [ ] Export to PDF/Excel
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] User authentication
- [ ] Email notifications

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra Documentation
2. Xem Issues trên GitHub
3. Tạo Issue mới với chi tiết lỗi
4. Contact team qua email

---

**🎉 Chúc bạn sử dụng hệ thống thành công!**
